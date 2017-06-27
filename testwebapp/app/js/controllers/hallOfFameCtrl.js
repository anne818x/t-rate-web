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

$scope.topRatedTeach1 =[];
$scope.atmosTrt1 = [];
$scope.helpTrt1 = [];
$scope.lecTrt1 = [];
$scope.prepTrt1 = [];
$scope.profTrt1 = [];

if ($scope.topRatedTeach1.length == 0) {
	//get top rated
			var array1 = [];
			var array2 = [];
			var array3 = [];
			var array4 = [];
			var array5 = [];
			var array6 = [];

			$scope.teachers.$loaded().then(function (teachers) {
	
				for (var i = 0; i < teachers.length; i++) {
						array1.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Total * 2) / 2});
						array2.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Avg_Atmosphere * 2) / 2});
						array3.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Avg_Helpfulness* 2) / 2});
						array4.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Avg_Lectures* 2) / 2});
						array5.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Avg_Preparation* 2) / 2});
						array6.push({name: teachers[i].TeachName, total: Math.round(teachers[i].Avg_Professionalism* 2) / 2});
				}
			}).then(function (ref) {
				array1.sort(compareSecondColumn);
				array2.sort(compareSecondColumn1);
				array3.sort(compareSecondColumn2);
				array4.sort(compareSecondColumn3);
				array5.sort(compareSecondColumn4);
				array6.sort(compareSecondColumn5);

				function compareSecondColumn(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				function compareSecondColumn1(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				function compareSecondColumn2(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				function compareSecondColumn3(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				function compareSecondColumn4(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				function compareSecondColumn5(a, b) {
						    if (a.total === b.total) {
						        return 0;
						    }
						    else {
						        return (a.total < b.total) ? -1 : 1;
						    }
				}

				$scope.topRatedTeach1.push({name: array1[0].name, total: array1[0].total});
				$scope.topRatedTeach1.push({name: array1[1].name, total: array1[1].total});
				$scope.topRatedTeach1.push({name: array1[2].name, total: array1[2].total});

				$scope.atmosTrt1.push({name: array2[0].name, total: array2[0].total});
				$scope.atmosTrt1.push({name: array2[1].name, total: array2[1].total});
				$scope.atmosTrt1.push({name: array2[2].name, total: array2[2].total});

				$scope.helpTrt1.push({name: array3[0].name, total: array3[0].total});
				$scope.helpTrt1.push({name: array3[1].name, total: array3[1].total});
				$scope.helpTrt1.push({name: array3[2].name, total: array3[2].total});

				$scope.lecTrt1.push({name: array4[0].name, total: array4[0].total});
				$scope.lecTrt1.push({name: array4[1].name, total: array4[1].total});
				$scope.lecTrt1.push({name: array4[2].name, total: array4[2].total});

				$scope.prepTrt1.push({name: array5[0].name, total: array5[0].total});
				$scope.prepTrt1.push({name: array5[1].name, total: array5[1].total});
				$scope.prepTrt1.push({name: array5[2].name, total: array5[2].total});

				$scope.profTrt1.push({name: array6[0].name, total: array6[0].total});
				$scope.profTrt1.push({name: array6[1].name, total: array6[1].total});
				$scope.profTrt1.push({name: array6[2].name, total: array6[2].total});

				// sessionStorage.temptop1Name = array1[0].name;
				// sessionStorage.temptop1Total = array1[0].total;

				// sessionStorage.temptop2Name = array1[1].name;
				// sessionStorage.temptop2Total = array1[1].total;

				// sessionStorage.temptop3Name = array1[2].name;
				// sessionStorage.temptop3Total = array1[2].total;

				// $scope.topRatedTeach1.push({name: sessionStorage.temptop1Name, total: sessionStorage.temptop1Total});
				// $scope.topRatedTeach1.push({name: sessionStorage.temptop2Name, total: sessionStorage.temptop2Total});
				// $scope.topRatedTeach1.push({name: sessionStorage.temptop3Name, total: sessionStorage.temptop3Total});

				
			})
}

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
				else if(snapshot.key == $scope.currentMod.name && snapshot.child("TopRated").child("TeacherID").val() == 0){
					var ref = firebase.database().ref('HallOfFame');
					ref.on("child_added", function (snapshot) {
						var lastChar = snapshot.key[snapshot.key.length -1];
						var prevPeriod = "Period_" + lastChar;
						if (snapshot.key == prevPeriod) {
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
										sessionStorage.shownCurrentMod = prevPeriod;
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
					});
				}
			});
	})
}

}]);
