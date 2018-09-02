import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

export const Dispositivos = new Mongo.Collection('dispositivos');
export const Permisos = new Mongo.Collection('permisos');
export const Admin = new Mongo.Collection('admin');


if (Meteor.isServer) {

  // This code only runs on the server
  var mqtt = require('mqtt'); 
  //var client = mqtt.connect('mqtt://200.8.81.144:1883');
  var client = mqtt.connect('mqtt://localhost:1883');
  client.subscribe('actuador');
  client.subscribe('sensor');



  Meteor.publish("user",function usersPublication() {
  	// body...
  	return Meteor.users.find();
  });


  Meteor.publish("admin",function adminPublication() {
    // body...
    return Admin.find();
  });

  Meteor.publish("permisos",function permisosPublication() {
    // body...
    return Permisos.find();
  });

  Meteor.publish("zonas", function() {
    // Remember, ReactiveAggregate doesn't return anything
    ReactiveAggregate(this, Dispositivos, [{
        // assuming our Reports collection have the fields: hours, books
        $group: {
            '_id':"$zona",
           
        }
    }, {
        $project: {
            // an id can be added here, but when omitted,
            // it is created automatically on the fly for you
            zona: '$zona'
        } // Send the aggregation to the 'clientReport' collection available for client use
    }], { clientCollection: "clientZona" });
});



   Meteor.publish('dispositivos', function dispositivosPublication() {

    return Dispositivos.find();

  });



   Meteor.methods({
        prender:function(data) {
        	console.log(data);
        	Dispositivos.update({_id:data.ide},{$set: {estado:data.estado,update:new Date()}});
            //client.publish(data.topic, data.message);
            var mensaje = data.ide+" turn "+data.estado;
            client.publish('actuador',mensaje);
        },

        cambiarValor:function(data) {
        	//console.log(data.message2);
            Dispositivos.update({_id:parseInt(data.message1,10)},{$set:{valor:data.message2,update:new Date()}});
        }, 

        cambiarPermiso:function(data){
            //console.log(data);
            //no existe
            if(Permisos.findOne({usuario:data.id,zona:data.zona})==null){
              //agregar
              Permisos.update({usuario:data.id},{$addToSet: {zona: data.zona }},{upsert: true});
            }else{
              //eliminar  { $pull: { zona:data.zona } }
              Permisos.update({usuario:data.id},{ $pull: { zona:data.zona } });
              //Si no tiene permisos, borrar el documento.
                if (Permisos.findOne({usuario:data.id,zona:{$size:0}})!=null){
                    Permisos.remove({usuario:data.id});
                }

            }
        }        


    });


client.on('message', Meteor.bindEnvironment(function (topic, message) {
  	
  		if (topic.toString()=='sensor'){

		//console.log("en el sensor " + message)
		var mensaje = message.toString().split(" ");

		Meteor.call('cambiarValor', {'message1' : mensaje[0], 'message2' : mensaje[1]});
		//console.log("primero  " +mensaje[0] + "  segundo  "+mensaje[1]);


};


}));




}