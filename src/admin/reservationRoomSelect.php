<?php
require_once("engineHeader.php");
recurseInsert("includes/functions.php","php");

$error = FALSE; 

if (!isset($engine->cleanPost['MYSQL']['library']) && validate::integer($engine->cleanPost['MYSQL']['library']) === FALSE) {
	$error = TRUE;
}

localvars::add("libraryID",$engine->cleanPost['MYSQL']['library']);

// Get the building name
if ($error === FALSE) {
	$return = getBuildingName($engine->cleanPost['MYSQL']['library']);
	if ($return === FALSE) {
		$error = TRUE;
	}
	else {
		localvars::add("buildingName",$return);
	}
}

// build the select list
if ($error === FALSE) {

	$return = buildRoomList($engine->cleanPost['MYSQL']['library']);
	if ($return === FALSE) {
		$error = TRUE;
	}
	else {
		localvars::add("roomSelectOptions",$return);
	}
}

$type   = "reservation";
$action = "reservationCreate.php";
if (isset($engine->cleanGet['HTML']['type']) && $engine->cleanGet['HTML']['type'] == "series") {
	$type = "series";
	$action = "seriesCreate.php";
}

localvars::add("type",$type);
localvars::add("action",$action);

$engine->eTemplate("include","header");
?>

<header>
<h1>Reservation Creation -- Select Room</h1>
</header>

<a href="reservationLibrarySelect.php?type={local var="type"}">&lt;&lt; Select a different Building</a>
<br />

<form action="{local var="action"}" method="post">
	{csrf insert="post"}

	<input type="hidden" name="library" value="{local var="libraryID"}" />

	<label for="room">Rooms available in {local var="buildingName"}:</label>
	<select name="room" id="room">
		{local var="roomSelectOptions"}
	</select>

	<br /><br />
	<input type="submit" name="roomSubmit" value="Select Room" />
</form>


<?php
$engine->eTemplate("include","footer");

function buildRoomList($building) {

	$engine = EngineAPI::singleton();

	$sql       = sprintf("SELECT roomListDisplay, roomSortOrder FROM building WHERE ID='%s'",
		$engine->openDB->escape($building)
		);
	$sqlResult = $engine->openDB->query($sql);

	if (!$sqlResult['result']) {
		errorHandle::newError(__METHOD__."() - ".$sqlResult['error'], errorHandle::DEBUG);
		return(FALSE);
	}

	$buildingInfo = mysql_fetch_array($sqlResult['result'],  MYSQL_ASSOC);

	$sql = sprintf("SELECT * FROM `rooms` WHERE `building`='%s' ORDER BY rooms.%s",
		$engine->openDB->escape($building),
		$buildingInfo['roomSortOrder']
		);

	$sqlResult = $engine->openDB->query($sql);

	if (!$sqlResult['result']) {
		errorHandle::newError(__METHOD__."() - ".$sqlResult['error'], errorHandle::DEBUG);
		return(FALSE);
	}

	$options = "";
	while ($row = mysql_fetch_array($sqlResult['result'],  MYSQL_ASSOC)) {

		$displayName = str_replace("{name}", $row['name'], $buildingInfo['roomListDisplay']);
		$displayName = str_replace("{number}", $row['number'], $displayName);

		$options .= sprintf('<option value="%s">%s</option>',
			htmlSanitize($row['ID']),
			htmlSanitize($displayName)
			);
	}

	return($options);
}

?>