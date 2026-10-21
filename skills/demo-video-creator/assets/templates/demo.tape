# VHS tape for a REAL terminal recording (devtool-cli case). brew install vhs ; vhs demo.tape
# Run the real commands against a real project; never paste invented output. Output: capture/clips/term.mp4
Output capture/clips/term.mp4
Set Shell zsh
Set FontFamily "JetBrains Mono"
Set FontSize 30
Set Width 1600
Set Height 900
Set Padding 48
Set Framerate 30
Set TypingSpeed 45ms
Set Theme { "background": "#0B0D10", "foreground": "#C9D1D9", "cursor": "#3DDC97", "selection": "#1C2027", "black": "#0B0D10", "green": "#3DDC97", "blue": "#58A6FF", "yellow": "#F2CC60", "magenta": "#D2A8FF", "red": "#FF7B72", "cyan": "#76E3EA", "white": "#E6EDF3" }
Hide
Type "cd ~/demo-project && clear" Enter
Show
Sleep 400ms
Type "npx your-cli init" Sleep 300ms Enter
Sleep 3s
Type "npx your-cli run --watch" Sleep 300ms Enter
Sleep 4s
