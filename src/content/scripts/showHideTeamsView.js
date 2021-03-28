// Shows or hides the team size combobox when it is required

$('#type').change(function () {
  $('#type option:selected').val() === 'single'
    ? $('#tournamentTeamSize').attr('class', 'form-group d-none')
    : $('#tournamentTeamSize').attr('class', 'form-group')
})
