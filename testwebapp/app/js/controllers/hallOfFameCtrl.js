angular.module('myApp').controller('HallOfFameController', ['$scope', '$moment','SharingFactory','$firebaseArray', 'AlertFactory', function ($scope, $moment, SharingFactory, scanner, $firebaseArray, AlertFactory) {

var hallOfFameRef = firebase.database().ref("HallOfFame");
var teacherRef = firebase.database().ref("Teachers");
var modulesRef = firebase.database().ref("Modules");

//$scope.teachers = $firebaseArray(teacherRef);
//$scope.modules = $firebaseArray(modulesRef);
//$scope.hallOfFame = $firebaseArray(hallOfFameRef);
//$scope.teachers = $firebaseArray(teacherRef);
$scope.currentMod = {};
$scope.topRatedCom = [];
$scope.topRatedTeach = { name: sessionStorage.trtName, id: sessionStorage.trtId, atmos: sessionStorage.trtAtmos, help: sessionStorage.trtHelp, prep: sessionStorage.trtPrep, lec: sessionStorage.trtLec, prof: sessionStorage.trtProf, total: sessionStorage.trtTotal };
$scope.date =  $moment().format('YYYY-MM-DD');
$scope.currentMod = {};
$scope.shownCurrentMod = sessionStorage.shownCurrentMod;

if ($scope.topRatedTeach.length == undefined) {
	$scope.modules.$loaded().then(function (modules) {

		for (var i = 0; i < modules.length; i++) {
			if ($scope.date >= modules[i].startDate && $scope.date <= modules[i].endDate) {
				$scope.currentMod = { name: modules[i].$id, startDate: modules[i].startDate, endDate: modules[i].endDate };
			}
		}
	}).then(function (ref) {

		var ref = firebase.database().ref('HallOfFame');
			ref.on("child_added", function (snapshot) {
				if (snapshot.key == $scope.currentMod.name && snapshot.child("TeacherID").val() != 0) {

					$scope.teachers.$loaded().then(function (teachers) {
						for (var i = 0; i < teachers.length; i++) {
							if (teachers[i].TeacherID == snapshot.child("TeacherID").val()) {
								sessionStorage.trtName = teachers[i].TeachName;
								sessionStorage.trtId = snapshot.child("TeacherID").val();
								sessionStorage.trtTotal = snapshot.child("Total").val();
								sessionStorage.trtAtmos = snapshot.child("Avg_Atmosphere").val();
								sessionStorage.trtHelp = snapshot.child("Avg_Helpfulness").val();
								sessionStorage.trtLec = snapshot.child("Avg_Lectures").val();
								sessionStorage.trtProf = snapshot.child("Avg_Professionalism").val();
								sessionStorage.trtPrep = snapshot.child("Avg_Preparation").val();
								sessionStorage.shownCurrentMod = $scope.currentMod.name;
							}
						}
					});
				} 
				else if(snapshot.key == $scope.currentMod.name && snapshot.child("TeacherID").val() == 0){
					var ref = firebase.database().ref('HallOfFame');
					ref.on("child_added", function (snapshot) {
						var lastChar = snapshot.key[snapshot.key.length -1];
						var prevPeriod = "Period_" + lastChar;
						if (snapshot.key == prevPeriod) {
							$scope.teachers.$loaded().then(function (teachers) {
								for (var i = 0; i < teachers.length; i++) {
									if (teachers[i].TeacherID == snapshot.child("TeacherID").val()) {
									 	sessionStorage.trtName = teachers[i].TeachName;
										sessionStorage.trtId = snapshot.child("TeacherID").val();
										sessionStorage.trtTotal = snapshot.child("Total").val();
										sessionStorage.trtAtmos = snapshot.child("Avg_Atmosphere").val();
										sessionStorage.trtHelp = snapshot.child("Avg_Helpfulness").val();
										sessionStorage.trtLec = snapshot.child("Avg_Lectures").val();
										sessionStorage.trtProf = snapshot.child("Avg_Professionalism").val();
										sessionStorage.trtPrep = snapshot.child("Avg_Preparation").val();
										sessionStorage.shownCurrentMod = prevPeriod;
									}
								}
							});
						}
					});
				}
			});
	})
}

}]);
