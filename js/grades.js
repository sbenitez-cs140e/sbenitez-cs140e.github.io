(function() {
  var baseURL = "https://web.stanford.edu/class/cs140e/cgi-bin/";
  var gotError = false;
  var tableInitialized = false;
  var gradesDiv = $("#grades");
  var nojsDiv = $("#grades-no-js");
  var GRADES_TO_FETCH = [
    "assignment0", "assignment1", "assignment2", "assignment3", "summary"
  ];

  var tableHTML =
    "<table class='table table-striped table-hover table-bordered'>" +
      "<thead>" +
        "<tr>" +
          "<th>Assignment</th>" +
          "<th>Grade</th>" +
          "<th>Comments</th>" +
        "</tr>" +
      "</thead>" +
      "<tbody id='grade-table-body'>" +
        "</tbody>" +
      "</table>";

  function makeViewCommentsButton(id) {
      return "<button class='btn btn-primary btn-xs' data-toggle='modal'" +
                "data-target='#" + id + "-comment'>" +
                "view comments" +
              "</button>";
  }

  function makeCommentsModal(id, assignmentName, comments) {
    return "<div class='modal fade' id='" + id + "-comment'" +
        "tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>" +
      "<div class='modal-dialog' role='document'>" +
        "<div class='modal-content'>" +
          "<div class='modal-header'>" +
            "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
            "<h4 class='modal-title' id='myModalLabel'>" +
              assignmentName + " Comments" +
            "</h4>" +
          "</div>" +
          "<div class='modal-body'>" +
            comments +
          "</div>" +
          "<div class='modal-footer'>" +
            "<button type='button' class='btn btn-default btn-sm' data-dismiss='modal'>Close</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function makeRow(id, assignmentName, grade, comment) {
    return "<tr>" +
             "<td>" + assignmentName + "</td>" +
             "<td>" + grade + "</td>" +
             "<td id='" + id + "-comment-row'>" + comment + "</td>" +
           "</tr>";
  }

  function addDataToTable(assignmentName, data) {
    if (!tableInitialized) {
      gradesDiv.html(tableHTML);
      tableInitialized = true;
    }

    // HACK to render external comments. Yuck.
    if (data.comment === "external") {
      data.comment = "Fetching comments...";

      var getCommentURL = baseURL + "getcomment.py?name=" + assignmentName;
      $.get(getCommentURL, function(commentHTML) {
        gradesDiv.append(makeCommentsModal(data.key, data.name, commentHTML));
        data.comment = makeViewCommentsButton(data.key);
      }).fail(function(ev) {
        data.comment = "<p class='text-danger' style='margin: 0;'>" +
          "Failed to fetch comment.</p>";
      }).always(function() {
        $("#" + data.key + "-comment-row").html(data.comment);
      });
    }

    var row = makeRow(data.key, data.name, data.grade, data.comment);
    $("#grade-table-body").append(row);
  }

  function retrieveAssignment(assignmentName) {
    var getGradeURL = baseURL + "getgrade.py?name=" + assignmentName;
    // Call the 'addDataToTable' function on a successful JSON request
    $.getJSON(getGradeURL, function(data) {
      // On add the data to the data if we've never received an error.
      if (!gotError) {
        data.key = assignmentName;
        addDataToTable(assignmentName, data);
      }
    }).fail(function(ev) {
      if (ev.status === 404) {
        var data = ev.responseJSON;
        var failData = {
          key: assignmentName,
          name: data.name,
          grade: "-",
          comment: "Grade not found."
        };

        addDataToTable(failData);
      } else {
        gotError = true;
        var errorText = "<p class='text-danger'>" +
                         "There was an error fetching your grades." +
                        "</p>";

        gradesDiv.html(errorText);
      }
    });
  }

  // Hide the "You don't have javascript" div.
  if (!!nojsDiv) {
    nojsDiv.hide();
  }

  // Create and populate the table.
  if (!!gradesDiv) {
    if (GRADES_TO_FETCH.length === 0) {
      gradesDiv.html("No grades have been made available.");
    } else {
      gradesDiv.html("Retrieving grades...");
      $.each(GRADES_TO_FETCH, function(i, name) {
        retrieveAssignment(name);
      });
    }
  }
})();
