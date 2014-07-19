<?php
require_once("../engineHeader.php");

$listObj = new listManagement("equipement",db::get("appDB"));

$options = array();
$options['field'] = "name";
$options['label'] = "Name";
$listObj->addField($options);
unset($options);

$options = array();
$options['field'] = "description";
$options['label'] = "Description";
$options['dupes'] = TRUE;
$options['blank'] = TRUE;
$options['type']  = "textarea";
$listObj->addField($options);
unset($options);

$options = array();
$options['field']     = "url";
$options['label']     = "URL";
$options['dupes']     = TRUE;
$options['blank']     = TRUE;
$options['validate']  = "url";
$listObj->addField($options);
unset($options);

$options = array();
$options['field'] = "type";
$options['label'] = "Type";
$options['dupes'] = TRUE;
$options['type']  = "select";

$db        = db::get($localvars->get('dbConnectionName'));
$sql       = sprintf("SELECT * FROM equipementTypes ORDER BY name");
$sqlResult = $db->query($sql);

if ($sqlResult->error()) {
	errorHandle::newError($sqlResult->errorMsg(), errorHandle::DEBUG);
}

$temp                 = array();
$temp['value']        = "NULL";
$temp['label']        = "-- Select File Type --";
$options['options'][] = $temp;

while($row       = $sqlResult->fetch()) {

	$selectValues          = array();
	$selectValues['value'] = $row['ID'];
	$selectValues['label'] = $row['name'];
	$options['options'][]  = $selectValues;

}
$listObj->addField($options);

$errorMsg = NULL;
if(isset($_POST['MYSQL']['equipement_submit'])) {
	$errorMsg = $listObj->insert();
	$errorMsg = errorHandle::prettyPrint();
}
else if (isset($_POST['MYSQL']['equipement_update'])) {
	$errorMsg = $listObj->update();
	$errorMsg = errorHandle::prettyPrint();
}

templates::display('header');
?>

<header>
<h1>Equipement Management</h1>
</header>

<?php
if (!isnull($errorMsg)) {
?>
<section id="actionResults">
	<header>
		<h1>Results</h1>
	</header>
	<?php print $errorMsg; ?>
</section>
<?php } ?>


<section>
<header><h1>New Equipement</h1></header>
{listObject display="insertForm" addGet="true"}
</section>

<section>
<header><h1>Edit Equipement</h1></header>
{listObject display="editTable" addGet="true"}
</section>


<?php
templates::display('footer');
?>