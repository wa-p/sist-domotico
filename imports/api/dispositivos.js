import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

export const Dispositivos = new Mongo.Collection('dispositivos');
export const Permisos = new Mongo.Collection('permisos');
export const Admin = new Mongo.Collection('admin');
export const Rutinas = new Mongo.Collection('rutinas');
Contador = new Mongo.Collection('contadorDispositivo');


if (Meteor.isServer) {

  // This code only runs on the server
  var mqtt = require('mqtt'); 
  //var client = mqtt.connect('mqtt://200.8.81.156:1883');
  var client = mqtt.connect('mqtt://localhost:1883');
  client.subscribe('casa/leds');
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

   Meteor.publish('rutinas', function rutinasPublication() {

    return Rutinas.find();

  });



   Meteor.methods({

        //CONTROLAR FUNCIONES DE ACTUADOR
        prender:function(data) {
        	console.log(data);
        	Dispositivos.update({_id:data.ide},{$set: {estado:data.estado,update:new Date()}});
            //client.publish(data.topic, data.message);
            var mensaje = data.ide+" turn "+data.estado;

            //##############################################
            //    DEVOLVER AL ESTADO INICIAL               #       
            //    TOPICO="ACTUADOR", MENSAJE="TURN ON/OFF" # 
            //##############################################
            if (data.estado=="off"){
              client.publish('casa/leds',"ledcuartoff");  
            }else if (data.estado=="on"){
              client.publish('casa/leds',"ledcuarton");  
            }
            
        },



        //ACTUALIZAR ESTADO DE SENSOR
        cambiarValor:function(data) {
        	//console.log(data.message2);
            Dispositivos.update({_id:data.message1},{$set:{valor:data.message2,update:new Date()}});
        }, 



        //MODIFICAR PERMISOS DE USUARIOS
        cambiarPermiso:function(data){
            //console.log(data);
            //NO EXISTE EL PERMISO
            if(Permisos.findOne({usuario:data.id,zona:data.zona})==null){
              //AGREGAR UN PERMISO
              Permisos.update({usuario:data.id},{$addToSet: {zona: data.zona }},{upsert: true});
            }else{
              //ELIMINAR UN PERMISO
              Permisos.update({usuario:data.id},{ $pull: { zona:data.zona } });
              //SI NO TIENE PERMISOS BORRAR EL DOCUMENTO
                if (Permisos.findOne({usuario:data.id,zona:{$size:0}})!=null){
                    Permisos.remove({usuario:data.id});
                }

            }
        } ,



        //MODIFICAR PERMISO DE ADMINISTRADOR
        cambiarAdmin:function(data){
            //console.log(data);
            //no existe
            if(Admin.findOne({usuario:data.id})==null){
              //agregar
              Admin.insert({usuario:data.id});
            }else{
              //eliminar  { $pull: { zona:data.zona } }
              Admin.remove({usuario:data.id});

            }
        },


        //AGREGAR NUEVO DISPOSITIVO
        newdisp:function(d){
         


          if (d.tipo=="sensor") {
              Dispositivos.insert({
                                   "nombre":d.nombre,
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":"unidades",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin
                                 })
          }else{

             Dispositivos.insert({
                                   "nombre":d.nombre,
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "estado":"off",                                   
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin
                                 })

          }


          //HACER LLAMADA A FUNCION DE ACTUALIZAR DATOS EN RPI
          //client.publish('casa/leds',"ledcuarton");  v


        },
        editdisp:function(d){
          //console.log(getNextID("productid"));


          
              Dispositivos.update({_id:d.id},
                                    {$set:{
                                       "nombre":d.nombre,
                                       "zona":d.zona,
                                       "tipo":d.tipo,
                                       "valor":0,
                                       "unidad":"unidades",
                                       "update":new Date(),
                                       "icono":d.icono,
                                       "pin":d.pin
                                      }
                                  });
        
             //HACER LLAMADA A FUNCION DE ACTUALIZAR DATOS EN RPI
             // client.publish('casa/leds',"ledcuarton");  

          

        },

        //ELIMINAR DISPOSITIVO
        eliminar:function(d){
          
          var a = Dispositivos.findOne({_id:d.id}).zona;
          console.log("zona a eliminar: "+a);
          Dispositivos.remove({_id:d.id});
          
          //VERIFICAR QUE AUN QUEDAN DISPOSITIVOS
          if (Dispositivos.findOne({zona:a}) == null) {
              console.log("entre al nulo");
              //ELIMINAR TODOS LOS PERMISOS
              Permisos.update({},{ $pull: { zona:a} },{ upsert: false, multi: true });
          }

        },    



        newauto: function(d){
          //console.log(d.frecuencia.split(" "));
          Rutinas.insert({
                        nombre:d.nombre,
                        fecha_inicio:d.fecha_inicio,
                        fecha_fin:d.fecha_fin,
                        hora_encendido:d.hora_encendido,
                        hora_apagado:d.hora_apagado,
                        frecuencia:d.frecuencia.split(" "),
                        dispositivos:d.dispositivos.split(" ")
                  });
        },

        editauto: function(d){
          //console.log(d.frecuencia.split(" "));
          Rutinas.update({_id:d.id},
                        {$set:{
                          nombre:d.nombre,
                          fecha_inicio:d.fecha_inicio,
                          fecha_fin:d.fecha_fin,
                          hora_encendido:d.hora_encendido,
                          hora_apagado:d.hora_apagado,
                          frecuencia:d.frecuencia.split(" "),
                          dispositivos:d.dispositivos.split(" ")
                  }});
        },

        cambioestatus: function(d){
          Rutinas.update({_id:d.id},{$set:{estatus:d.estado}});
          // ENVIAR MENSAJE MQTT
          // client.publish('casa/leds',"ledcuarton");  

        }  



    });


//RECEPCION DE MENSAJE POR MQTT
client.on('message', Meteor.bindEnvironment(function (topic, message) {
  	
  		if (topic.toString()=='sensor'){

		//console.log("en el sensor " + message)
		var mensaje = message.toString().split(" ");

		Meteor.call('cambiarValor', {'message1' : mensaje[0], 'message2' : mensaje[1]});
		//console.log("primero  " +mensaje[0] + "  segundo  "+mensaje[1]);


};


  console.log(message.toString());

}));

function getNextID(sec){

    Contador.update({_id: sec },{$inc:{secuencia:1}});
    var s = Contador.findOne({_id: sec });
    
    return s.secuencia.toString();
}




}

