import { Template } from 'meteor/templating';
import { Dispositivos } from '../api/dispositivos.js';
import { Permisos } from '../api/dispositivos.js';
import { Admin } from '../api/dispositivos.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
//import { FlowRouter } from 'meteor/kadira:flow-router';
import './bodys.html';
import '../../client/layouts/MainLayout.html';

clientZona = new Mongo.Collection('clientZona');

Template.body.onCreated(function bodyOnCreated() {

  this.state = new ReactiveDict();
  Session.set('zona_actual',null)


  Meteor.subscribe('dispositivos');
  Meteor.subscribe('zonas');
  Meteor.subscribe('user');
  Meteor.subscribe('permisos');
  Meteor.subscribe('admin');




});


Template.bodys.helpers({
	admin: function (a) {
    	// body...
    	if (Admin.findOne({usuario:a})!=null){
    		return true;
    	}else{
    		return false;
    	}
    }
})

 Template.bodys.onRendered(function () {
        
        $('.collapsible').collapsible();
        $('.sidenav').sidenav();
        
        
      }); 


Template.login.events({
    'submit .login-form': function(e) {
        e.preventDefault();
        var email = e.target.email.value;
        var password = e.target.password.value;
      Meteor.loginWithPassword(email, password,function(error){
            if(error) {
                //do something if error occurred or 
            }else{
               //FlowRouter.go('/');
               $(".login-form").hide();
            }
        });
     },
      'click .logout': function(e) {
        Meteor.logout();

       FlowRouter.go('/');
       $(".sidenav").toggle();
     }



 });



Template.principal.helpers({

  dispositivos() {

    return Dispositivos.find({zona:Session.get('zona_actual')});

  },

  zonas(){
  		//console.log("return zonas");
  		zonas = Permisos.find({usuario:Meteor.userId()}).fetch()[0].zona;
  		//console.log(Permisos.find({usuario:Meteor.userId()}).fetch()[0].zona);
        return clientZona.find({_id: {$in: zonas}});
  },
  equals: function(a, b) {
        return a == b;
    },
    data: function() {
        var paramsStatus = Router.current().params._status;
        return paramsStatus;
    }

});


Template.configuracion.events({
	


	//SUBMIT DEL FORMULARIO DE NUEVOS DISPOSITIVOS
  'submit #new-disp'(event) {

    // Prevent default browser form submit

    event.preventDefault();
    // Get value from form element

    const target = event.target;


	Meteor.call('newdisp',{ "nombre":target.nombre.value,
							"zona":target.zona.value,
							"tipo":target.tipo.value,		   
							"icono":target.icono.value,
							"pin":target.pin.value,
							"valor":0,
		   					"unidad":"unidades", 
							});

	
		$('.modal').modal('close', "#modal1");
   	Materialize.toast('Agregado satisfactoriamente');

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
 

    // Clear form

    
	$("#new-disp").trigger("reset");

	
	
  },

//SUBMIT DEL FORMULARIO DE NUEVOS DISPOSITIVOS
   'submit #edit-disp'(event) {

    // Prevent default browser form submit

    event.preventDefault();
    // Get value from form element

    const target = event.target;

   
   	

    
	Meteor.call('editdisp',{"id":target.id.value,
							"nombre":target.nombre.value,
							"zona":target.zona.value,
							"tipo":target.tipo.value,		   
							"icono":target.icono.value,
							"pin":target.pin.value
							
		   					, 
							});

	$('.modal').modal('close', "#modal2");

	$('#edit-disp').trigger("reset");

   	Materialize.toast('Editado satisfactoriamente');

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
 

    // Clear form

    
	//document.getElementById("new-disp").reset();
	


	}





  
});



 
Template.principal.events({
	'change .switch': function(event) {
  var x = event.target.checked;
  //Session.set("statevalue", x);
  //console.log(event.target.checked);
  var zona=event.target.getAttribute("data-zona");
  var id = event.target.getAttribute("data-id");
  var estado;
  var mensaje;

  if (x==true) {
  	//mensaje=event.target.id  + " on";
  	estado = "on";
  	mensaje= id + " turn on";
  } else{
  	estado = "off";
  	mensaje= id + " turn off";
  }
  //console.log(mensaje)
  //Dispositivos.update({"_id":id},{$set: {"estado":estado,"update":new Date()}});
  Meteor.call('prender', {'ide' : this._id, 'estado' : estado});
 },

'click .zona':function(event,temp){
	//var a = event.target.innerHTML;
	//alert(a);
	//console.log(event.target.getAttribute("data-valor"));
	//console.log(temp.state.get( 'email_user' ));
	var a = event.target.getAttribute("data-zona");
	if (a == "null"){
		Session.set('zona_actual',null);
	}else{
		Session.set('zona_actual',a);
	
	}
			console.log(event.target);
			$('a').removeClass("active");
            $(event.target).addClass("active");
	//console.log(event.target.getAttribute("data-zona") +" zona evento" )
	


}


});


Template.configpermiso.helpers({
	users(){
		return Meteor.users.find({});
	},
	zonas(){
  		//console.log("return zonas");
        return clientZona.find();
    },
    userEmail(){
    	return this.emails.address; },
    permiso: function(a,b){
    	//si existe
    	//console.log(a+" "+b);
    	//console.log(Permisos.findOne({usuario:a,zona:b})!=null);
    	if (Permisos.findOne({usuario:a,zona:b})!=null){
    		return true;
    	}else{
    		return false;
    	}
    },
    admin: function (a) {
    	// body...
    	if (Admin.findOne({usuario:a})!=null){
    		return true;
    	}else{
    		return false;
    	}
    }

});

Template.configpermiso.events({
	'change .permiso': function(event) {
  var x = event.target.checked;
  
  var string = event.target.getAttribute("id");
  var datos = string.split("_");
  

  
  Meteor.call('cambiarPermiso', {'id' : datos[2], 'zona' : datos[1]});
 },

 'change .admin': function(event) {
  var x = event.target.checked;
  
  var string = event.target.getAttribute("id");
  var datos = string.split("_");
  

  Meteor.call('cambiarAdmin', {'id' : datos[1]});
 }


});

 Template.configdisp.onRendered(function () {
        $('select').material_select();
        $('.modal').modal();
        $('.collapsible').collapsible();
        $('.tooltipped').tooltip();
      });


Template.configdisp.helpers({
	 dispositivos() {

    return Dispositivos.find({});

  },

  zonas(){
  		
  		/*zonas = Permisos.find({usuario:Meteor.userId()}).fetch()[0].zona;
  		
        return clientZona.find({_id: {$in: zonas}});
    */
    	return clientZona.find();	
        },

    equals: function(a, b) {
        return a == b;
    },

});


Template.configdisp.events({

	//ELIMINAR DISPOSITIVO
	'click .eliminar':function(event){
		
		var a = event.target.getAttribute("data-id");
		
		Meteor.call('eliminar',{id:a});
		document.getElementById("configdisp_"+a).remove();
		Materialize.toast('Eliminado satisfactoriamente');

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
	},

	//MODIFICAR DISPOSITIVO
	'click .editar':function(event){
		
		var a = event.target.getAttribute("data-id");
		console.log(a);
		var dsp = Dispositivos.findOne({_id:a});
		$('#edit_nombre').val(dsp.nombre);
		$('#edit_nombre').siblings('label, .prefix').addClass('active');
		$('#edit_zona').val(dsp.zona);
		$('#edit_zona').siblings('label, .prefix').addClass('active');
		$('#edit_pin').val(dsp.pin);
		$('#edit_pin').siblings('label, .prefix').addClass('active');
		$("#edit_id").val(dsp._id);
		$("#edit_icono").val(dsp.icono).trigger("change");
		$("#edit_icono").material_select()
		if (dsp.tipo=="sensor") {
			$('#edit_sensor').prop("checked", true);
		} else {
			$('#edit_actuador').prop("checked", true);
		}

		$('#boton_modal_editar')[0].click();
		
		
	},

})

 