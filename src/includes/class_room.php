<?php

class room {
	
	private $rooms = array();
	private $engine;
	private $localvars;
	private $db;

	function __construct() {

		$this->engine    = EngineAPI::singleton();
		$this->localvars = localvars::getInstance();
		$this->db        = db::get($localvars->get('dbConnectionName'));

	}

	public function get($ID) {

		if (!validate::getInstance()->integer($ID)) {
			return FALSE;
		}

		if (isset($this->rooms[$ID]) && !is_empty($this->rooms[$ID]['name'])) {
			return $this->rooms[$ID]['name'];
		}

		$sql       = sprintf("SELECT * FROM rooms WHERE `ID`=?");
		$sqlResult = $this->db->query($sql,array($ID));

		if ($sqlResult->error()) {
			errorHandle::newError(__FUNCTION__."() - Error getting room name.", errorHandle::DEBUG);
			return(FALSE);
		}

		if ($sqlResult->rowCount() < 1) {
			errorHandle::errorMsg("Room not found.");
			return FALSE;
		}

		$this->rooms[$ID] = $sqlResult->fetch();

		return $this->rooms[$ID];

	}

	public function getPicture($ID) {

		$room = $this->get($ID);

		if (!isset($room['pictureURL']) || is_empty($room['pictureURL'])) {
			return "";
		}

		return sprintf('<img src="%s" id="roomPicture" alt="%s -- %s" />',$room['pictureURL'],$room['name'],$room['number']);

	}
}