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
$scope.topRatedHelp = { name: sessionStorage.helpName, id: sessionStorage.helpId, help: sessionStorage.helpValue};
$scope.topRatedAtmos = { name: sessionStorage.atmosName, id: sessionStorage.atmosId, atmos: sessionStorage.atmosValue};
$scope.topRatedLec = { name: sessionStorage.lecName, id: sessionStorage.lecId, lec: sessionStorage.lecValue};
$scope.topRatedPrep = { name: sessionStorage.prepName, id: sessionStorage.prepId, prep: sessionStorage.prepValue};
$scope.topRatedProf = { name: sessionStorage.profName, id: sessionStorage.profId, prof: sessionStorage.profValue};
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
				if (snapshot.key == $scope.currentMod.name && snapshot.child("TopRated").child("TeacherID").val() != 0) {
					console.log(snapshot.key);
					$scope.teachers.$loaded().then(function (teachers) {
						for (var i = 0; i < teachers.length; i++) {
							if (teachers[i].TeacherID == snapshot.child("TopRated").child("TeacherID").val()) {
								sessionStorage.trtName = teachers[i].TeachName;
								sessionStorage.trtId = snapshot.child("TopRated").child("TeacherID").val();
								sessionStorage.trtTotal = snapshot.child("TopRated").child("Total").val();
								sessionStorage.trtAtmos = snapshot.child("TopRated").child("Avg_Atmosphere").val();
								sessionStorage.trtHelp = snapshot.child("TopRated").child("Avg_Helpfulness").val();
								sessionStorage.trtLec = snapshot.child("TopRated").child("Avg_Lectures").val();
								sessionStorage.trtProf = snapshot.child("TopRated").child("Avg_Professionalism").val();
								sessionStorage.trtPrep = snapshot.child("TopRated").child("Avg_Preparation").val();
								sessionStorage.shownCurrentMod = $scope.currentMod.name;
							}

							if (teachers[i].TeacherID == snapshot.child("Helpfulness").child("TeacherID").val()) {
								sessionStorage.helpId = snapshot.child("Helpfulness").child("TeacherID").val();
								sessionStorage.helpValue = snapshot.child("Helpfulness").child("Avg_Helpfulness").val();
								sessionStorage.helpName = teachers[i].TeachName;
							}

							if (teachers[i].TeacherID == snapshot.child("Atmosphere").child("TeacherID").val()) {
								sessionStorage.atmosId = snapshot.child("Atmosphere").child("TeacherID").val();
								sessionStorage.atmosValue = snapshot.child("Atmosphere").child("Avg_Atmosphere").val();
								sessionStorage.atmosName = teachers[i].TeachName;
								
							}

							if (teachers[i].TeacherID == snapshot.child("Lectures").child("TeacherID").val()) {
								sessionStorage.lecId = snapshot.child("Lectures").child("TeacherID").val();
								sessionStorage.lecValue = snapshot.child("Lectures").child("Avg_Lectures").val();
								sessionStorage.lecName = teachers[i].TeachName;
							}

							if (teachers[i].TeacherID == snapshot.child("Preparation").child("TeacherID").val()) {
								sessionStorage.prepId = snapshot.child("Preparation").child("TeacherID").val();
								sessionStorage.prepValue = snapshot.child("Preparation").child("Avg_Preparation").val();
								sessionStorage.prepName = teachers[i].TeachName;
								
							}

							if (teachers[i].TeacherID == snapshot.child("Professionalism").child("TeacherID").val()) {
								sessionStorage.profId = snapshot.child("Professionalism").child("TeacherID").val();
								sessionStorage.profValue = snapshot.child("Professionalism").child("Avg_Professionalism").val();
								sessionStorage.profName = teachers[i].TeachName;
							
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
										sessionStorage.trtId = snapshot.child("TopRated").child("TeacherID").val();
										sessionStorage.trtTotal = snapshot.child("TopRated").child("Total").val();
										sessionStorage.trtAtmos = snapshot.child("TopRated").child("Avg_Atmosphere").val();
										sessionStorage.trtHelp = snapshot.child("TopRated").child("Avg_Helpfulness").val();
										sessionStorage.trtLec = snapshot.child("TopRated").child("Avg_Lectures").val();
										sessionStorage.trtProf = snapshot.child("TopRated").child("Avg_Professionalism").val();
										sessionStorage.trtPrep = snapshot.child("TopRated").child("Avg_Preparation").val();
										sessionStorage.helpId = snapshot.child("Helpfulness").child("TeacherID").val();
										sessionStorage.helpValue = snapshot.child("Helpfulness").child("Avg_Helpfulness").val();
										sessionStorage.atmosId = snapshot.child("Atmosphere").child("TeacherID").val();
										sessionStorage.atmosValue = snapshot.child("Atmosphere").child("Avg_Atmosphere").val();
										sessionStorage.lecId = snapshot.child("Lectures").child("TeacherID").val();
										sessionStorage.lecValue = snapshot.child("Lectures").child("Avg_Lectures").val();
										sessionStorage.prepId = snapshot.child("Preparation").child("TeacherID").val();
										sessionStorage.prepValue = snapshot.child("Preparation").child("Avg_Preparation").val();
										sessionStorage.profId = snapshot.child("Professionalism").child("TeacherID").val();
										sessionStorage.profValue = snapshot.child("Professionalism").child("Avg_Professionalism").val();
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
