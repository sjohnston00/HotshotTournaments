$(function () {
  const tournament = $("#tournament-bracket");
  const bracketValue = JSON.parse($("#tournament-bracket-textarea").val());

  tournament.bracket({
    init: bracketValue,
    save: saveData,
    centerConnectors: true,
    disableToolbar: true,
    teamWidth: 100
  });
});

function saveData(data) {
  $("#tournament-bracket-textarea-2").text(`${JSON.stringify(data)}`);
  $("#btn-edit-tournament").text(`Save Tournament`);
}

// const savedTournamentButton = document.querySelector("#btn-edit-tournament");
// savedTournamentButton.addEventListener("click", async (e) => {
//   if (confirm("Are you sure you want to save these changes?")) {
//     const tournamentID = document.querySelector("#tournamentID");
//     const bracket = document.querySelector("#tournament-bracket-textarea");
//     fetch(`/tournaments/saveTournamentBracket/${tournamentID.textContent}`, {
//       method: "POST",
//       body: {
//         bracket: bracket.textContent
//       }
//     });
//   } else {
//     return;
//   }
// });
