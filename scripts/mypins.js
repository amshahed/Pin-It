$(document).ready(function(){
	if (localStorage.getItem('email')==null)
		window.open('/','_self');

	$('#sout').hide();
	$('.g-signin2').show();
	$('.allpins').hide();
	$('.mypins').hide();
	$('.addpin').hide();

	var $grid = $('.grid').masonry({
	  // options
	  itemSelector: '.grid-item',
	  columnWidth: 220,
	  gutter: 10
	});
	
	var email = localStorage.getItem('email');
	$.ajax({
		type: 'POST',
		data: {email},
		url: '/seeimages',
		success: function(json){
			if (json.hasOwnProperty('error')){
				toastr.error(json.error, '', {timeOut: 1300});
				return;
			}
			for (var i=0; i<json.length; i++){
				var name = json[i].name.split(' ')[0];
				var div = '<div class="grid-item">';
				div += '<img onerror="imgError(this)" class="imgs" src="'+json[i].link+'">';
				div += '<div class="info-holder">';
				div += '<h3 class="title">'+json[i].title+'</h3>';
				div += '<label class="owner">'+name+'</label>';
				div += '<div class="pull-right">';
				div += '<i class="fa fa-times" onclick="deleteimg(\''+json[i]._id+'\')"></i>&nbsp;&nbsp;';
				div += '</div></div></div>';
				var $div = $(div);
				$grid.append($div).masonry('appended', $div);
			}
		}
	})
})

function addPin(){
	const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
	var link = $('#link').val();
	var title = $('#title').val();
	if (link=='' || title=='')
		toastr.error('Enter valid info', '', {timeOut: 1300});
	else if (!link.match(regex)){
		toastr.error('Enter a valid URL', '', {timeOut: 1300});
	}
	else {
		var email = localStorage.getItem('email');
		var name = localStorage.getItem('name');
		$.ajax({
			type: 'POST',
			data: { link, title, name, email },
			url: '/addpin',
			success: function(json){
				$('#link').val('');
				$('#title').val('');
				if (json.hasOwnProperty('error')){
					toastr.error(json.error, '', {timeOut: 1300});
					return;
				}
				toastr.success('Image added', '', {timeOut: 1300});
				closeModal();
				location.reload();
			}
		})
	}
}

function deleteimg(id){
	$.ajax({
		type: "POST",
		data: {id},
		url: '/delete',
		success: function(json){
			if (json.hasOwnProperty('error')){
				toastr.error(json.error, '', {timeOut: 1300});
				return;
			}
			else {
				toastr.success('Successfully deleted', '', {timeOut: 1300});
				location.reload();
			}
		}
	})
}

function openModal(){
	$('#addpinmodal').css('display', 'block');
}

function closeModal(){
	$('#addpinmodal').css('display', 'none');
}

function imgError(image) {
    image.onerror = "";
    image.src = "http://lh5.ggpht.com/_9F9_RUESS2E/SpV5Yi8Vv5I/AAAAAAAAA4E/W9-J8eMLokM/s800/50-Cool-and-Creative-404-Error-Pages-25.jpg";
    return true;
}

function onSignIn(googleUser) {
	$('#sout').show();
	$('.g-signin2').hide();
	$('.allpins').show();
	$('.mypins').show();
	$('.addpin').show();
	var profile = googleUser.getBasicProfile();
	localStorage.setItem('name', profile.getName());
	localStorage.setItem('email', profile.getEmail());
	$('.navbar-brand').html(localStorage.getItem('name'));
}

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		localStorage.clear();
	  	$('#sout').hide();
	  	$('.g-signin2').show();
	  	$('.navbar-brand').html('Pin It');
	  	$('.allpins').hide();
		$('.mypins').hide();
		$('.addpin').hide();
	});
}