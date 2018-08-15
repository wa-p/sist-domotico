import { Mongo } from 'meteor/mongo';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

export const Dispositivos = new Mongo.Collection('dispositivos');


if (Meteor.isServer) {

  // This code only runs on the server



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
        },

        cambiarValor:function(data) {
            Equipos.update({nombre:data.message1},{$set:{valor:data.message2}});
        }


    });

}