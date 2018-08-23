import { Template } from 'meteor/templating';
import { Dispositivos } from '../api/dispositivos.js';
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

});


Template.principal.helpers({

  dispositivos() {

    return Dispositivos.find({zona:Session.get('zona_actual')});

  },

  zonas(){
  		//console.log("return zonas");
        return clientZona.find();
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
	/*'click .config':function(event,temp){
	
	var a = event.target.getAttribute("data-config");
	if (a == "null"){
		Session.set('configuracion',null);
	}else{
		Session.set('configuracion',a);
	
	}
	console.log(event.target.getAttribute("data-config") +" tipo config" )
	


},
*/



  'submit .new-disp'(event) {

    // Prevent default browser form submit

    event.preventDefault();
    // Get value from form element

    const target = event.target;

   // const text = target.text.value;

    console.log(target.nombre.value);
 	console.log(target.tipo.value);
 	console.log(target.zona.value);
 	console.log(target.pin.value);

    /*Insert a task into the collection

    Tasks.insert({

      text,

      createdAt: new Date(), // current time

    });
*/
 

    // Clear form

    target.nombre.value = '';
	document.getElementById("sensor").checked=false;
	document.getElementById("actuador").checked=false;
	target.zona.value= '';
	target.pin.value= '';

  },

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
	console.log(event.target.getAttribute("data-zona") +" zona evento" )
	


}


});


Template.configpermiso.helpers({
	users(){
		return Meteor.users.find({});
	}
});

Template.email.helpers({
	 zonas(){
  		//console.log("return zonas");
        return clientZona.find();
  },
})