(*
  phone number needs to come in the format of +15555555555 ,5555#
*)

on run(arguments)
  log "start"

  log arguments

  set phone_number to item 1 of arguments
  set dtmf to item 2 of arguments

  tell application "Skype"
    log "tell Skype"
      set active_call to send command "CALL " & phone_number script name ""
      log active_call
      set skype_call_id to word 2 of active_call
      log skype_call_id
      delay 10
      set bridge to "ALTER CALL " & skype_call_id & " DTMF "
      repeat with tone in the characters of dtmf
          if tone contains "," then
              delay 2
          else
              send command bridge & " " & tone script name "s2"
              delay 0.2
          end if
      end repeat
  end tell

end run
