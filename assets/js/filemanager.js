/**
 * Created by Bram on 21/07/16.
 */

// global variables
var jsonPath = "files/files.json";
var navigation = [];

/*
Execute when document's ready
 */
$(document).ready(function(){
    // on first load, get filelist and draw filemanager
    fileList = getFileList(jsonPath);
    if (fileList.length > 0) {
        drawFileManager();
    }
});

/*
Get the filelist
 */
function getFileList() {
    var result;
    // ajax request, get the filelist json
    $.ajax({
        url: jsonPath,
        dataType: 'json',
        async: false,
        success: function(data) {
            result = data;
        }
    });
    return result;
}

/*
Draw the file manager
 */
function drawFileManager(directoryInfo, breadCrumbIndex) {
    updateNavigation(directoryInfo, breadCrumbIndex);
    drawBreadCrumbs();
    drawFiles();

    if (navigation.length == 0) {
        // navigation is in root, hide back button
        $("#backbtn").hide();
    }
    else {
        // navigation is outside root show back button
        $("#backbtn").show();
    }
}

/*
 Update the navigation flow
 */
function updateNavigation(directoryInfo, breadCrumbIndex) {
    if($.isNumeric(breadCrumbIndex)) {
        // split navigation (clicked on breadcrumb)
        navigation.splice(breadCrumbIndex+1);
    }
    else {
        if(!directoryInfo) {
            // step backward
            navigation.pop();
        }
        else {
            // step forward
            navigation.push(directoryInfo);
        }
    }
}

/*
 Draw the breadcrumbs
 */
function drawBreadCrumbs() {
    $("#breadcrumbs").empty();
    // set root crumb
    $("#breadcrumbs").append("<li>&nbsp;/&nbsp;</li>");
    // loop through paths and draw each directory
    $.each(navigation, function(index){
       $("#breadcrumbs").append("<li><a onclick='drawFileManager(\"\","+index+")'>"+this['title']+"</a>&nbsp;/&nbsp;</li>");
    });
}

/*
Draw files within current path
 */
function drawFiles() {
    // loop through filelist and define the current path
    currentPath = fileList;
    $.each(navigation, function(key, value) {
        currentPath = currentPath[value["index"]]["data"];
    });

    // remove all tr, except the headings
    $("#filelist").find("tr:gt(0)").remove();

    // loop through files in current path
    $.each(currentPath, function(key, fileInfo){
        // check if type is folder. If so, bind function on double click
        var appendFunction = "";
        if (fileInfo['type'] == "folder") {
            appendFunction = "ondblclick='openFolder(event);'";
        }
        else if (fileInfo['type'] == "image") {
            appendFunction = "ondblclick='openImage(event);'";
        }

        var fileDate = convertTimestamp(fileInfo['date']);

        // add tr to table
        $("#filelist").append(
            "<tr "+appendFunction+" id='"+key+"' class='type-"+fileInfo['type']+"'>" +
            "<td class='icon'><span></span></td>" +
            "<td class='name'>"+fileInfo['value']+"</td>" +
            "<td class='size'>"+fileInfo['size']/1000+"</td>" +
            "<td class='date'>"+fileDate+"</td>" +
            "<td class='type'>"+fileInfo['type']+"</td>" +
            "</tr>"
        );
    });
}

/*
Open folder (binded on double clicked element)
 */
function openFolder(e) {
    var target = e.currentTarget;
    var index = $(target).attr("id");
    var folderName = $(target).find("td.name").html();
    drawFileManager({"index" : index, "title" : folderName});
}

/*
Open image (binded on double clicked element)
 */
function openImage(e) {
    var target = e.currentTarget;
    var fileName = $(target).find("td.name").html();
    alert("open image:\n"+fileName);
}

/*
Convert timestamp to readable date format (yyyy-mm-dd hh:mm:ss)
 */
function convertTimestamp(timestamp) {
    if (!$.isNumeric(timestamp)) {
       return false;
    }
    var date = new Date(timestamp * 1000);
    date = date.toLocaleString();
    return date;
}