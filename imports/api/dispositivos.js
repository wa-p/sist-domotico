import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

export const Dispositivos = new Mongo.Collection('dispositivos');
export const Permisos = new Mongo.Collection('permisos');
export const Admin = new Mongo.Collection('admin');
export const Rutinas = new Mongo.Collection('rutinas');
export const Pin = new Mongo.Collection('pin');
export const TipoDisp = new Mongo.Collection('tipodispositivo');
Contador = new Mongo.Collection('contadorDispositivo');


if (Meteor.isServer) {

  // This code only runs on the server
  var mqtt = require('mqtt'); 
  //var client = mqtt.connect('mqtt://200.8.81.156:1883');
  var client = mqtt.connect('mqtt://localhost:1883');
  client.subscribe('actuador');
  client.subscribe('sensor');
  client.subscribe('rutina');
  client.subscribe('casa/#');

//casa/config <sensor/actuador> <<ldr/dht>/<led/act>> <pin> <area_casa> <add/rm>  (agregar o eliminar un dispositivo)
//casa/leds <pin> <on/off> (encender o apagar un led)
//casa/actuador <pin> <on/off> (encender o apagar)
//casa/automatico <pin> <area_casa> <led/aire/puerta> <on/off> <horario>


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

   Meteor.publish('pin', function pinPublication() {

    return Pin.find();

  });

    Meteor.publish('tipodispositivo', function tipoDispPublication() {

    return TipoDisp.find();

  });


   Meteor.methods({

        //CONTROLAR FUNCIONES DE ACTUADOR
        prender:function(data) {
        	console.log(data);
        	Dispositivos.update({pin:data.ide},{$set: {estado:data.estado,update:new Date()}});
            //client.publish(data.topic, data.message);
            var mensaje = data.ide+" "+data.estado;
            var m= data.ide +" "+ data.estado;
            //var esp = Dispositivos.findOne({_id:data.ide})
            //client.publish('casa/air', m );

            if (data.especifico=='air') {
              client.publish('casa/air', m );   
            }else {
              client.publish('casa/leds', m );
            }
           
            //casa/actuador <data.ide> <data.estado> (encender o apagar)

            //##############################################
            //    DEVOLVER AL ESTADO INICIAL               #       
            //    TOPICO="ACTUADOR", MENSAJE="TURN ON/OFF" # 
            //##############################################
            //if (data.estado=="off"){
             // client.publish('actuador',mensaje);  
            //}else if (data.estado=="on"){
             // client.publish('casa/leds',"ledcuarton");  
            //}
            //client.publish('actuador',mensaje);  
            //client.publish('casa', "mensaje de prueba" );
        },

        //ACTUALIZAR ESTADO DE ACTUADORES

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
              if (d.tipo=='dht') {

                 var temp = Dispositivos.insert({
                                   "nombre":d.nombre + "temp",
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":" °C",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico
                                 });

                  var hum = Dispositivos.insert({
                                   "nombre":d.nombre + "hum",
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":" %RH",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico
                                 })
                  //mensaje para configurar los identificadores ?
                  //client.publish('casa/config/dht',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");
                  //client.publish('casa/config/dht',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");

              } else {

                  Dispositivos.insert({
                                   "nombre":d.nombre,
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":"unidades",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico
                                 })

                  
              }
              
          }else{

             Dispositivos.insert({
                                   "nombre":d.nombre,
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "estado":"off",                                   
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico
                                 })

             

          }
          Pin.update({_id:d.id},{$set: {estado:'ocupado'}});

          //HACER LLAMADA A FUNCION DE ACTUALIZAR DATOS EN RPI
          //client.publish('sensor',d.tipo +" "+pin+" add");

          client.publish('casa/config',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");

          if (d.tipo=='dht') {
            client.publish('casa/config/dht',d.pin+" "+hum +" hum");
            client.publish('casa/config/dht',d.pin+" "+temp +" temp");
          }
          //casa/config <d.tipo> <d.especifico> <pin> <d.zona> <add>  (agregar o eliminar un dispositivo)

        },
        editdisp:function(d){
          //console.log(getNextID("productid"));

            //var del = Dispositivos.find(_id:d.id)
            //client.publish('casa/config',del.tipo+" "+ del.especifico+" "+del.pin+" "+del.zona +" rm");

                  
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
             //eliminar el anterior
             
            //casa/config <d.tipo> <d.especifico> <pin> <d.zona> <rm>  (agregar o eliminar un dispositivo)
            //agregar el nuevo
            //client.publish('casa/config',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");
            //casa/config <d.tipo> <d.especifico> <pin> <d.zona> <add>  (agregar o eliminar un dispositivo)


                    

        },

        //ELIMINAR DISPOSITIVO
        eliminar:function(d){
          
          var a = Dispositivos.findOne({_id:d.id}).zona;
          console.log("zona a eliminar: "+a);
          var dsp = Dispositivos.findOne({_id:d.id})
          //client.publish('casa/config',dsp.zona + " "+dsp.nombre + " off");
          client.publish('casa/config',dsp.tipo+" "+ dsp.especifico+" "+dsp.pin+" "+dsp.zona +" rm");
          //casa/config <d.tipo> <d.especifico> <pin> <d.zona> <rm>  (agregar o eliminar un dispositivo)
          var pin = Pin.update({pin:parseInt(dsp.pin)},{$set:{estado:"libre"}} )

          Dispositivos.remove({_id:d.id});
          
          //VERIFICAR QUE AUN QUEDAN DISPOSITIVOS
          if (Dispositivos.findOne({zona:a}) == null) {
              console.log("entre al nulo");
              //ELIMINAR TODOS LOS PERMISOS
              Permisos.update({},{ $pull: { zona:a} },{ upsert: false, multi: true });
          }

          

        },    




/*

LkTHoMzaFt7DgTQNd temp
pGQDNmwswkQXfpp63 hum



{ "_id" : "LkTHoMzaFt7DgTQNd", "nombre" : "Sensor temp", "zona" : "cuarto", "tipo" : "sensor", "valor" : "0", "unidad" : "°C", "update" : ISODate("2019-07-01T02:25:59.824Z"), "icono" : "whatshot", "pin" : "2", "especifico" : "dht" }
{ "_id" : "pGQDNmwswkQXfpp63", "nombre" : "Sensor hum", "zona" : "cuarto", "tipo" : "sensor", "valor" : "0", "unidad" : "%RH", "update" : ISODate("2019-07-01T02:25:59.824Z"), "icono" : "invert_colors", "pin" : "2", "especifico" : "dht" }



*/


         




      //NUEVA AUTOMATIZACION
        newauto: function(d){
          //console.log(d.frecuencia.split(" "));
          var rutina = Rutinas.insert({
                        nombre:d.nombre,
                        hora_encendido:d.hora_encendido,
                        hora_apagado:d.hora_apagado,
                        frecuencia:d.frecuencia.split(" "),
                        dispositivos:d.dispositivos.split(" ")
                  });
          
         //Falta el numero de identificacion del registro en la coleccion rutinas
          //console.log(d.hora_encendido.split(":")[0] + "  :::: " + d.hora_encendido.split(":")[1]  );
          var array_dsp = d.dispositivos.split(" ");
          array_dsp.forEach(function(actual){
            var dsp = Dispositivos.findOne({_id:actual});
            //console.log('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_encendido.split(":")[1] +" "+ d.hora_encendido.split(":")[0]+" * * "+ d.frecuencia.replace(/ /g,",") +" on");
            //console.log('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_apagado.split(":")[1] +" "+ d.hora_apagado.split(":")[0]+" * * "+ d.frecuencia.replace(/ /g,",")+" off");
            client.publish('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_encendido.split(":")[1] +"/"+ d.hora_encendido.split(":")[0]+"/*/*/"+ d.frecuencia.replace(/ /g,",") +" "+rutina+" add on");
            client.publish('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_apagado.split(":")[1] +"/"+ d.hora_apagado.split(":")[0]+"/*/*/"+ d.frecuencia.replace(/ /g,",")+" "+rutina+" add off");

          })
          
        },

        //EDITAR AUTOMATIZACION EXISTENTE
        editauto: function(d){
          //console.log(d.frecuencia.split(" "));
          Rutinas.update({_id:d.id},
                        {$set:{
                          nombre:d.nombre,
                          hora_encendido:d.hora_encendido,
                          hora_apagado:d.hora_apagado,
                          frecuencia:d.frecuencia.split(" "),
                          dispositivos:d.dispositivos.split(" ")
                  }});
          console.log(d.frecuencia.split(" "));

          //console.log("zona a eliminar: "+a);
          //var dsp = Dispositivos.findOne({_id:d.id})
          //client.publish('casa/config',dsp.zona + " "+dsp.nombre + " off");
         

          client.publish('casa/automatico','rm '+d.id);

          var array_dsp = d.dispositivos.split(" ");
          array_dsp.forEach(function(actual){
            var dsp = Dispositivos.findOne({_id:d.idl});
            //console.log('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_encendido.split(":")[1] +" "+ d.hora_encendido.split(":")[0]+" * * "+ d.frecuencia.replace(/ /g,",") +" on");
            //console.log('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_apagado.split(":")[1] +" "+ d.hora_apagado.split(":")[0]+" * * "+ d.frecuencia.replace(/ /g,",")+" off");
            client.publish('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_encendido.split(":")[1] +"/"+ d.hora_encendido.split(":")[0]+"/*/*/"+ d.frecuencia.replace(/ /g,",") +" "+rutina+" add on");
            client.publish('casa/automatico',dsp.pin+" "+dsp.zona+" "+dsp.especifico+" "+ d.hora_apagado.split(":")[1] +"/"+ d.hora_apagado.split(":")[0]+"/*/*/"+ d.frecuencia.replace(/ /g,",")+" "+rutina+" add off");

          })


        },

        //CAMBIAR ESTATUS DE ACTIVA A INACTIVA
        cambioestatus: function(d){
          Rutinas.update({_id:d.id},{$set:{estatus:d.estado}});
          // ENVIAR MENSAJE MQTT
          // client.publish('casa/leds',"ledcuarton");  
          console.log(d.frecuencia.split(" "));

        },


        // ACTUALIZAR ESTATUS DE ACTUADORES AUTOMATIZADOS
        cambiaractuador:function(data) {
          //console.log(data.message2);
            Dispositivos.update({pin:data.message2},{$set:{estado:data.message1,update:new Date()}});
        }, 


        eliminarauto:function(d){
          
          var a = Rutinas.remove({_id:d.id});
          //console.log("zona a eliminar: "+a);
          //var dsp = Dispositivos.findOne({_id:d.id})
          //client.publish('casa/config',dsp.zona + " "+dsp.nombre + " off");
         

          client.publish('casa/automatico','rm '+d.id);
          //client.publish('casa/automatico','4 cuarto air 14/19/*/*/6 rm off');
          //client.publish('casa/automatico','18 sala led 11/19/*/*/6 rm');
          //client.publish('casa/automatico','18 sala led 14/19/*/*/6 rm off');
          //client.publish('casa/automatico','24 cocina led 41/18/*/*/6 rm on');
          //client.publish('casa/automatico','24 cocina led 41/18/*/*/6 rm off');
        
          //casa/config <d.tipo> <d.especifico> <pin> <d.zona> <rm>  (agregar o eliminar un dispositivo)
          //var pin = Pin.update({pin:parseInt(dsp.pin)},{$set:{estado:"libre"}} )

          //Dispositivos.remove({_id:d.id});
          
          //VERIFICAR QUE AUN QUEDAN DISPOSITIVOS
          /*if (Dispositivos.findOne({zona:a}) == null) {
              console.log("entre al nulo");
              //ELIMINAR TODOS LOS PERMISOS
              Permisos.update({},{ $pull: { zona:a} },{ upsert: false, multi: true });
          }*/

          

        }



    });


//RECEPCION DE MENSAJE POR MQTT
client.on('message', Meteor.bindEnvironment(function (topic, message) {

        switch(topic.toString()) {
          case 'sensor':
            var mensaje = message.toString().split(" ");
            Meteor.call('cambiarValor', {'message1' : mensaje[0], 'message2' : mensaje[1]});
            break;
          case 'casa/dispositivo':
            console.log("entre en la actualizacion")
            var mensaje = message.toString().split(" ");
            Meteor.call('cambiaractuador', {'message1' : mensaje[0], 'message2' : mensaje[1]});
            break;
          default:
            console.log("entre en el caso default")
        } 
  	
  		

}));

function getNextID(sec){

    Contador.update({_id: sec },{$inc:{secuencia:1}});
    var s = Contador.findOne({_id: sec });
    
    return s.secuencia.toString();
}




}

