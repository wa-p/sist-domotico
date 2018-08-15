import { Template } from 'meteor/templating';
import { Dispositivos } from '../api/dispositivos.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import './body.html';


clientZona = new Mongo.Collection('clientZona');

Template.body.onCreated(function bodyOnCreated() {

  this.state = new ReactiveDict();
  Session.set('zona_actual',null)

  Meteor.subscribe('dispositivos');
  Meteor.subscribe('zonas');

});


Template.body.helpers({

  dispositivos() {

    return Dispositivos.find({zona:Session.get('zona_actual')});

  },

  zonas(){
  		
        return clientZona.find();
  }

});

 
Template.elemento.events({
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
 }

});


Template.elemento.helpers({
    equals: function(a, b) {
        return a == b;
    },
    data: function() {
        var paramsStatus = Router.current().params._status;
        return paramsStatus;
    }
})

Template.zona.events({
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
	console.log(event.target.getAttribute("data-zona") +"zona evento" )
	


}

});
