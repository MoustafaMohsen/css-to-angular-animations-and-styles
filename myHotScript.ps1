#Moustafa Mohesen 2018
#HardCoded Variables
$inputcsspath = "C:\Users\moust\Desktop\test-css-to-angular\animate.css"
$outputtspath = "C:\Users\moust\Desktop\test-css-to-angular\out\"
#$publishdirectory="C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations"


pause
node css-to-angular-styles $inputcsspath $outputtspath


#Copy-Item $outputtspath -Destination $publishdirectory -Force 



echo 'all done'
pause