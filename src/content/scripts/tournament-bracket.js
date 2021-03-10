$(function () {
  const tournament = $("#tournament-bracket");
  const bracketValue = JSON.parse($("#tournament-bracket-textarea").val());

  tournament.bracket({
    init: bracketValue,
    save: saveData,
    centerConnectors: true,
    disableToolbar: true,
    userData: "Data to send"
  });

  const currentData = tournament.bracket("data");
  // $("#saveOutput").text(`Initial data ${JSON.stringify(currentData, null, 2)}`);
});

function saveData(data, userData) {
  // $("#requestOutput").text(
  //   `POST https://api.com/api/${userData} ${JSON.stringify(data, null, 2)}`
  // );
}
