function copyText() {
  const tournamentLink = document.getElementById('tournamentInviteLink')
  tournamentLink.select()
  tournamentLink.setSelectionRange(0, 99999)
  document.execCommand('copy')
  alert(`Copied to your clipboard`)
}
