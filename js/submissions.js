(function() {
  var tableInitialized = false;
  var submissionsDivs = $("#submissions");
  var tableHTML =
    "<table class='table table-striped table-hover table-bordered'>" +
      "<thead>" +
        "<tr>" +
          "<th>Assignment</th>" +
          "<th>Submitted?</th>" +
          "<th>Last Submission</th>" +
        "</tr>" +
      "</thead>" +
      "<tbody id='submissions-table-body'>" +
        "</tbody>" +
      "</table>";

  function makeRow(assignmentName, submitNote, timestamp) {
    return "<tr>" +
             "<td>" + assignmentName + "</td>" +
             "<td>" + submitNote + "</td>" +
             "<td>" + timestamp + "</td>" +
           "</tr>";
  }

  function addDataToTable(data) {
    if (!tableInitialized) {
      submissionsDivs.html(tableHTML);
      tableInitialized = true;
    }

    $(data).each(function(i, submission) {
      var assignmentName = submission.name;
      var submitted = submission.submitted ? "✓" : "✗";
      var timestamp = "-";
      if (!!submission.submitted) {
        var raw = moment(submission.date, "YYYY-MM-DD-T-HH-mm-ss-SSSSSSS");
        timestamp = raw.format("MMMM Do YYYY, h:mma");
      }

      var newRow = makeRow(assignmentName, submitted, timestamp);
      $("#submissions-table-body").append(newRow);
    });
  }

  function retrieveSubmissions() {
    var URL = "https://web.stanford.edu/class/cs140e/cgi-bin/getsubmissions.py";

    // Call the 'addDataToTable' function on a successful JSON request
    $.getJSON(URL, function(data) {
      addDataToTable(data);
    }).fail(function(ev) {
      console.log(ev, ev.status);
      var errorText = "<p class='text-danger'>" +
        "There was an error fetching your submissions." +
        "</p>";

      submissionsDivs.html(errorText);
    });
  }

  // Create and populate the table.
  if (!!submissionsDivs) {
    // Set the initial text...
    submissionsDivs.html("Retrieving submissions...");

    // Fetch the submissions and populate the table.
    retrieveSubmissions();
  }
})();
