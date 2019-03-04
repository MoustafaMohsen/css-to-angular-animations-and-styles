#Moustafa Mohesen 2018
#HardCoded Variables
$inputcsspath = "C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations\custom.css"
$outputtspath = "./custom-animations.ts"
$publishdirectory="C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations"

$input1 = Read-Host 'Change input css path?(default is:"'$inputcsspath'")'
$input2 = Read-Host 'Change output ts path?(default is:"'$outputtspath'")'


if ( ![string]::IsNullOrWhitespace($input1)  )
{
$inputcsspath = $input1
}
else
{
}

if ( ![string]::IsNullOrWhitespace($input2)  )
{
$outputtspath = $input2
}
else
{
}



node css-to-angular-styles $inputcsspath $outputtspath




#Confirmation dialogue
$caption1 = "Please Confirm"    

[int]$defaultChoice1 = 0
$yes1 = New-Object System.Management.Automation.Host.ChoiceDescription "&Yes", "Push"
$no1 = New-Object System.Management.Automation.Host.ChoiceDescription "&No", "Don't Push"
$options1 = [System.Management.Automation.Host.ChoiceDescription[]]($yes1, $no1)
$choiceRTN1 = $host.ui.PromptForChoice($caption1,$message1, $options1,$defaultChoice1)
if ( $choiceRTN1 -ne 1 )
{

$input3 = Read-Host 'Change copy path?(default is:"'$publishdirectory'")'

if ( ![string]::IsNullOrWhitespace($input3)  )
{
$outputtspath = $input3
}
else
{
}



& Copy-Item $outputtspath -Destination $publishdirectory
}
else
{
}



echo 'all done'
pause