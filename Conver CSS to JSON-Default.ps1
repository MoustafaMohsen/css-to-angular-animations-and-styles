#Moustafa Mohesen 2018
#HardCoded Variables
$inputcsspath = "./input.css"
$outputtspath = "./output.ts"


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

echo 'all done'
pause