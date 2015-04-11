var modalCalendarURL    = roomReservationHome+"/calendar/calendar.php";
var buildingCalendarURL = roomReservationHome+"/calendar/building/";
var calendarData;

$(document).ready(initialCalendarLoad);

$(function() {
	$(document)
		.on('click',  '.calendarModal_link',  handler_calModal)
		.on('click',  '.mapModal_link',       handler_mapModal)
		.on('click',  '.calUpdateButton',     handler_changeCalDate)
		.on('click',  '#calUpdateFormSubmit', handler_changeCalDateForm)
		.on('click',  '#deleteReservation',   handler_deleteReservation)
		.on('click',  '.cancelReservation',   handler_deleteReservation)
		.on('click',  '#closeModalCalendar',  handler_closeModal)
		.on('click',  '#calUpdateFormSubmit', handler_getCalendarJSON)
		.on('change', '#listBuildingSelect',  handler_listBuildingSelect)
		.on('click',  '.pagerLink',           handler_pager)
});

function initialCalendarLoad() {
	handler_getCalendarJSON(false);
	setPagerAttributes(0,numberOfColumns);
}

function handler_pager() {

	var startCols = parseInt($(this).attr("data-startCols"));
	var endCols   = parseInt($(this).attr("data-endCols"));

	// build the new calendar
	buildCalendarTable(calendarData,startCols,endCols);

	// set the new pager variables
	setPagerAttributes(startCols,endCols);

	return false;
}

function setPagerAttributes(startCols,endCols) {

	// prev
	$('#pagerPrev').attr('data-startCols',(startCols-numberOfColumns < 0)?0:startCols-numberOfColumns);
	$('#pagerPrev').attr('data-endCols',(endCols-numberOfColumns <=0)?numberOfColumns:endCols-numberOfColumns);

	// next
	$('#pagerNext').attr('data-startCols',(endCols >= calendarData.rooms.length)?calendarData.rooms.length-numberOfColumns:endCols);
	$('#pagerNext').attr('data-endCols',(endCols+numberOfColumns > calendarData.rooms.length)?calendarData.rooms.length:endCols+numberOfColumns);

	// last
	$('#pagerLast').attr('data-startCols',(calendarData.rooms.length-numberOfColumns));
	$('#pagerLast').attr('data-endCols',calendarData.rooms.length);

}

function buildRoomList(data) {

	$.each(data.rooms, function (index, room) {

		$("#mobileList").append('<li><a href="'+roomReservationHome+'/building/room/?room='+room.roomID+'">'+room.displayName+'</a></li>');

	});

}

function buildCalendarTable(data,startCols,endCols) {

	// data = $.parseJSON(data)
	// console.log(data);

	if (numberOfColumns <= 0) {
		buildRoomList(data);
		return;
	}

	// remove existing content
	$('#reservationsRoomTableHeaderRow').empty();
	$('#reservationsRoomTableBody').empty();

	// add in empty cell
	$('#reservationsRoomTableHeaderRow').append('<td class="tdHours tdEmpty">&nbsp;</td>');

    $.each(data.times, function (index, value) {
    	if (value.type == "hour") {
    		$('#reservationsRoomTableBody').append('<tr id="tr_'+index+'" class="'+value.type+'"><th scope="row" class="tdHours" rowspan="4">'+value.display+'</th></tr>');
    	}
    	else {
    		$('#reservationsRoomTableBody').append('<tr id="tr_'+index+'" class="'+value.type+'"></tr>');
    	}
    	// console.log(value);
    });

    var bookings = new Array();
    bookings[""] = "foo"; // Set the empty value, otherwise the first empty value will show as undefined.

    var count = 0
    $.each(data.rooms, function (index, room) {

    	if (count >= startCols && count < endCols) {

    		$('#reservationsRoomTableHeaderRow').append('<th scope="col" class="calendarCol"><a href="'+roomReservationHome+'/building/room/?room='+room.roomID+'">'+room.displayName+'</a></th>');

    		$.each(room.times, function (index, time) {
				// console.log(time);
				// console.log(index);
				// console.log(parseInt(index)+900);
				// if (typeof room.times[parseInt(index)+900] != 'undefined') {
				// 	console.log(room.times[parseInt(index)+900].reserved);
				// }

    			if (time.hourType == "hour") {
    				hasAddIndicator = false;
    			}

    			tdReservationClass = time.hourType+((time.reserved)?" reserved":" notReserved");

    			var tdContent = "";
    			if (time.reserved && typeof bookings[time.booking] == 'undefined') {
    				tdContent = '<span class="reservationName">'+time.username+'</span>&nbsp; <span class="reservationTime">'+time.displayTime+'</span>&nbsp; <span class="reservationDuration">'+time.duration+'</span>';

    				bookings[time.booking] = time.booking;
    			}
    			// If the quarter hour is not reserved
    			// and there hasn't been a reservation indicator added for this hour yet
    			// and it isn't the last 15 minutes of an hour
    			// and the next 15 minute block isn't reserved
    			// Add the indicator. 
    			// 
    			// This should only add the indicator if there is at least 30 minutes in a block. 
    			else if (time.reserved === false && hasAddIndicator === false && time.hourType != "quarterTill" && typeof room.times[parseInt(index)+900] != 'undefined' && room.times[parseInt(index)+900].reserved === false) {
    				hasAddIndicator = true;
    				tdContent = '<a href="'+roomReservationHome+'/building/room/?room='+room.roomID+'&reservationSTime='+index+'" class="roomClick"><i class="fa fa-plus"></i></a>';
    			}
    			else if (time.reserved === false && hasAddIndicator === true) {
    				tdContent = '<a href="'+roomReservationHome+'/building/room/?room='+room.roomID+'&reservationSTime='+index+'" class="roomClick roomClickEmpty"></a>';
    			}

    			$('#tr_'+index).append('<td class="'+tdReservationClass+'">'+tdContent+'</td>');

    		});
    	}
    	count++;
    	// console.log(value);
    });

}

function handler_getCalendarJSON(sync) {

	sync = (typeof sync !== 'undefined')? sync : true;

	var url = roomReservationHome+"/includes/ajax/getCalendarJson.php?type="+"building"+"&objectID="+$("#building_modal").val()+"&month="+$("#start_month_modal").val()+"&day="+$("#start_day_modal").val()+"&year="+$("#start_year_modal").val();
	// alert(url);
	$.ajax({
		url: url,
		dataType: "json",
		success: function(responseData) {

			calendarData = $.parseJSON(responseData);
			buildCalendarTable(calendarData,0,numberOfColumns);
			setHeaderDate();

		},
		error: function(jqXHR,error,exception) {
			$("#calendarData").html("Error retrieving calendar infocmation.");
		},
		async:   sync

	});

	return false;

}

function setHeaderDate() {
	var url = roomReservationHome+"/includes/ajax/getHeaderDate.php?month="+$("#start_month_modal").val()+"&day="+$("#start_day_modal").val()+"&year="+$("#start_year_modal").val();
	
	$.ajax({
		url: url,
		dataType: "html",
		success: function(responseData) {
			
			$("#headerDate").html(responseData);
			

		},
		error: function(jqXHR,error,exception) {
			$("#headerDate").html("Error retrieving date.");
		}

	});
}

function handler_listBuildingSelect() {

	var url = roomReservationHome+"/includes/ajax/getBuildingRooms.php?buildingID="+$("#listBuildingSelect").val();

	$.ajax({
		url: url,
		dataType: "json",
		success: function(responseData) {

			// remove all the current elements
			$("#listBuildingRoomsSelect").find('option').remove().end()

			// Add the "Any Room" option back in
			if ($("#listBuildingRoomsSelect").attr('data-anyroom') != "false") {
				$("#listBuildingRoomsSelect").append("<option value='any'>Any Room</option>")
			}

			$.each(responseData, function(i, room) {

			$("#listBuildingRoomsSelect").append("<option value='"+room.ID+"'>"+room.name+" - "+room.number+"</option>")

			})

		},
		error: function(jqXHR,error,exception) {

		}

	});

	return false;

}

function handler_closeModal() {
	$.modal.close();
}

function handler_calModal() {
	var type = $(this).attr('data-type');
	var url  = "";

	url = roomReservationHome+"/calendar/calendar.php?"+type+"="+$(this).attr('data-id');

	$.ajax({
		url: url,
		dataType: "html",
		success: function(responseData) {
			console.log($('#calendarModal'));
			$('#calendarModal').html(responseData);
			$('#calendarModal').modal({overlayClose:true});
			// $('#reservationsRoomTable').tableScroll({height:360});
		},
		error: function(jqXHR,error,exception) {
			$('#calendarModal').html("An Error has occurred: "+error);
			$('#calendarModal').modal({overlayClose:true});
		}
	});


	return false;
}

function handler_mapModal() {
	var url = $(this).attr("href");

	var src = url;
	$.modal('<iframe src="' + src + '" height="800" width="600" style="border:0; overflow: hidden;">', {
		closeHTML:"",
		containerCss:{
			backgroundColor:"#fff",
			borderColor:"#fff",
			height:450,
			padding:0,
			width:830
		},
		overlayClose:true,
		minHeight:700,
		minWidth: 500,
	});
	

	// $.ajax({
	// 	url: url,
	// 	success: function(responseData) {
	// 		$('#calendarModal').html(responseData);
	// 		$('#calendarModal').modal({overlayClose:true});
	// 	},
	// 	error: function(jqXHR,error,exception) {
	// 		$('#calendarModal').html("An Error has occurred: "+error);
	// 		$('#calendarModal').modal({overlayClose:true});
	// 	}
	// });

	return(false);
}

function handler_changeCalDate() {
	var month = $(this).attr('data-month');
	var day   = $(this).attr('data-day');
	var year  = $(this).attr('data-year');
	var type  = $(this).attr('data-type');

	url = (($(this).attr('data-modal') == "true")?modalCalendarURL:buildingCalendarURL)+"?"+type+"="+$(this).attr('data-id')+"&month="+month+"&day="+day+"&year="+year;

	if ($(this).attr('data-modal') == "false") {
		window.location.href = url;
		return;
	}

	$.ajax({
		url: url,
		dataType: "html",
		success: function(responseData) {
			$('#calendarModal').html(responseData);
				// $('#calendarModal').modal({overlayClose:true});
				// $('#reservationsRoomTable').tableScroll({height:360});
			},
			error: function(jqXHR,error,exception) {
				$('#calendarModal').html("An Error has occurred: "+error);
				// $('#calendarModal').modal({overlayClose:true});
			}
		});
}

function handler_changeCalDateForm() {
	var month = $('#start_month_modal option:selected').val();
	var day   = $('#start_day_modal option:selected').val();
	var year  = $('#start_year_modal option:selected').val();
	var type  = $(this).attr('data-type');
	var id    = $(this).attr('data-id');

	url = (($(this).attr('data-modal') == "true")?modalCalendarURL:buildingCalendarURL)+"?"+type+"="+$(this).attr('data-id')+"&month="+month+"&day="+day+"&year="+year;

	if ($(this).attr('data-modal') == "false") {
		window.location.href = url;
		return;
	}

	$.ajax({
		url: url,
		dataType: "html",
		success: function(responseData) {
			$('#calendarModal').html(responseData);
				// $('#calendarModal').modal({overlayClose:true});
				// $('#reservationsRoomTable').tableScroll({height:360});
			},
			error: function(jqXHR,error,exception) {
				$('#calendarModal').html("An Error has occurred: "+error);
				// $('#calendarModal').modal({overlayClose:true});
			}
		});
}

function handler_deleteReservation() {
	return confirm("Are you sure you want to Cancel this reservation?");
}