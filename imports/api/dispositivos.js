import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { Email } from 'meteor/email'
import { Accounts } from 'meteor/accounts-base'

export const Dispositivos = new Mongo.Collection('dispositivos');
export const Permisos = new Mongo.Collection('permisos');
export const Admin = new Mongo.Collection('admin');
export const Rutinas = new Mongo.Collection('rutinas');
export const Pin = new Mongo.Collection('pin');
export const TipoDisp = new Mongo.Collection('tipodispositivo');
export const Programas = new Mongo.Collection('programas');
export const Historico = new Mongo.Collection('historico');
Contador = new Mongo.Collection('contadorDispositivo');
export const Alerta = new Mongo.Collection('alerta');
export const Telegram = new Mongo.Collection('telegram');

if (Meteor.isServer) {

const TelegramBot = require('node-telegram-bot-api')

const token = '1590371037:AAG7R_-Z3ca3Qa97Xgz-MIjKAUoRiNqPK00'

const bot = new TelegramBot(token, { polling: true })



  //INTERVALO CADA HORA (3600000) PARA ACTUALIZAR LOS REGISTROS Y LOS PROMEDIOS
  Meteor.startup(function () {
    Meteor.setInterval(() => {

      

      Dispositivos.find({tipo:"sensor"}).forEach( function(dsp) { 
          //console.log("primer find")
          Historico.update({id:dsp._id,nombre:dsp.nombre,zona:dsp.zona,tipo:"sensor",especifico:dsp.especifico,pin:dsp.pin,icono:dsp.icono},{$push:{fecha:{fecha:dsp.update,valor:parseFloat(dsp.valor)}}},{upsert:true})

        Historico.find({nombre:dsp.nombre}).forEach(function(val){
          //console.log("segundo find")
          var cont_t= 0, cont_a= 0, cont_m= 0, cont_s= 0, cont_h = 0;
          var sum_t= 0, sum_a= 0, sum_m= 0, sum_s= 0, sum_h = 0;
          var avg_t, avg_a, avg_m, avg_s, avg_h = 0;
          
          val.fecha.forEach(function(prom){
            //PROMEDIO TOTAL
            sum_t += prom.valor;
            cont_t++;          

            //PROMEDIO ANNO
            if(prom.fecha >= new Date(new Date().getTime() - (365 * 24 * 60 * 60 * 1000))){
                sum_a += prom.valor;
                cont_a++;      
            };

            //PROMEDIO MES
            if(prom.fecha >= new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000))){
                sum_m += prom.valor;
                cont_m++;      
            };

            //PROMEDIO SEMANA
            if(prom.fecha >= new Date(new Date().getTime() - (8 * 24 * 60 * 60 * 1000))){
                sum_s += prom.valor;
                cont_s++;      
            };

            //PROMEDIO DIA
            if(prom.fecha >= new Date(new Date().getTime() - (24 * 60 * 60 * 1000))){
                sum_h += prom.valor;
                cont_h++;      
            }

            
          })

          if (cont_t==0) { cont_t=1};
          if (cont_a==0) { cont_a=1};
          if (cont_m==0) { cont_m=1};
          if (cont_s==0) { cont_s=1};
          if (cont_h==0) { cont_h=1};
          
          //console.log(dsp.nombre +"   "+sum_t + " "+cont_t)
          //console.log(val.nombre + "  avg "+sum/cont);
          //console.log("update")
          Historico.update({id:dsp._id,nombre:dsp.nombre,zona:dsp.zona,tipo:"sensor",especifico:dsp.especifico,pin:dsp.pin,icono:dsp.icono},{$set:{avg_total:sum_t/cont_t,avg_anno:sum_a/cont_a,avg_mes:sum_m/cont_m, avg_semana:sum_s/cont_s, avg_hoy:sum_h/cont_h}},{upsert:true}) 
         
        })  
      })  

          
       
      //EQUIV A 1 HORA  3600000
    }, 600000);
  });

  // This code only runs on the server
  var mqtt = require('mqtt'); 
  //var client = mqtt.connect('mqtt://200.8.81.156:1883');
  var client = mqtt.connect('mqtt://localhost:1883');
  client.subscribe('actuador');
  client.subscribe('sensor');
  client.subscribe('rutina');
  client.subscribe('flame');
  client.subscribe('casa/#');
  client.subscribe('registro');
  client.subscribe('telegram/#');




  
//casa/config <sensor/actuador> <<ldr/dht>/<led/act>> <pin> <area_casa> <add/rm>  (agregar o eliminar un dispositivo)
//casa/leds <pin> <on/off> (encender o apagar un led)
//casa/actuador <pin> <on/off> (encender o apagar)
//casa/automatico <pin> <area_casa> <led/aire/puerta> <on/off> <horario>
//users.update({_id: "onYRvK4yfyDb8GEBH"}, {$set: {"profile.casa": ObjectId("5d9e85a891266a8e71627edb")});

Meteor.publish('alertas', function alertasPublication() {
    //var a = Meteor.user().profile.casa
    //return Dispositivos.find({"casa":a});
    return Alerta.find()
  });


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
    //var a = Meteor.user().profile.casa

    

    //return Dispositivos.find({"casa":a});
    return Dispositivos.find()
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

    Meteor.publish("aires",function airessPublication() {
    // body...
    return Dispositivos.find({especifico:"air"})
  });


    Meteor.publish("programas",function programasPublication() {
    // body...
    return Programas.find()
  });

     Meteor.publish("eventos",function eventosPublication() {
    // body...
    return Historico.find({});
  });

     Meteor.publish("telegram",function telegramPublication() {
    // body...
    return Telegram.find();
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
              if (d.especifico=='dht') {

                 var temp = Dispositivos.insert({
                                   "nombre":d.nombre + "temp",
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":" °C",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico,
                                   "casa":Meteor.user().profile.casa
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
                                   "especifico":d.especifico,
                                   "casa":Meteor.user().profile.casa
                                 });

                  // result.insertedId.toString() ;


                  //mensaje para configurar los identificadores ?
                  //client.publish('casa/config/dht',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");
                  //client.publish('casa/config/dht',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add");

              } else {

                  var air = Dispositivos.insert({
                                   "nombre":d.nombre,
                                   "zona":d.zona,
                                   "tipo":d.tipo,
                                   "valor":0,
                                   "unidad":"unidades",
                                   "update":new Date(),
                                   "icono":d.icono,
                                   "pin":d.pin,
                                   "especifico":d.especifico,
                                   "casa":Meteor.user().profile.casa
                                   
                                 });
                  if (d.especifico=="air") {
                    Dispositivos.update({"_id":air},{$set:{"tempactual":20,"controltemp.temperatura":20,"controltemp.estatus":"off"}})
                  }

                  
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
                                   "especifico":d.especifico,
                                   "casa":Meteor.user().profile.casa
                                 })

             

          }
          Pin.update({_id:d.id},{$set: {estado:'ocupado'}});

          //HACER LLAMADA A FUNCION DE ACTUALIZAR DATOS EN RPI
          //client.publish('sensor',d.tipo +" "+pin+" add");

          client.publish('casa/config',d.tipo+" "+ d.especifico+" "+d.pin+" "+d.zona +" add "+d.id);

          if (d.especifico=='dht') {
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
          //console.log(d.frecuencia.split(" "));

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
          //console.log(d.frecuencia.split(" "));

        },


        // ACTUALIZAR ESTATUS DE ACTUADORES AUTOMATIZADOS
        cambiaractuador:function(data) {
          //console.log(data.message2);
            //Dispositivos.update({pin:data.message1},{$set:{estado:data.message2,update:new Date()}});
            //console.log(Dispositivos.findOne({_id:data.message1}).estado)
             Dispositivos.update({_id:data.message1},{$set:{estado:data.message2,update:new Date()}});
             //console.log(Dispositivos.findOne({_id:data.message1}).estado)
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

          

        },
        //MODIFICAR VALOR DE TEMPEATURA OBJETIVO DEL AIRE
        cambiartempaire:function(d){

          if(d.accion == "subir"){
              Dispositivos.update({_id:d.id},{$inc:{tempactual:1}});
          }else if(d.accion == "bajar"){
              Dispositivos.update({_id:d.id},{$inc:{tempactual:-1}});
          }

          //FALTA ENVIAR MENSAJE MQTT

        },
        controltempvalor:function(d){

          if(d.accion == "subir"){
              Dispositivos.update({_id:d.id},{$inc:{"controltemp.temperatura":1}});
          }else if(d.accion == "bajar"){
              Dispositivos.update({_id:d.id},{$inc:{"controltemp.temperatura":-1}});
          }

          var dsp = Dispositivos.findOne({_id:d.id});
          client.publish('casa/aire/auto',dsp.pin+' '+dsp.controltemp.estatus+' '+dsp.controltemp.temperatura);

        },


        //MODIFICAR ESTATUS DE FUNCIONAMIENTO DE ACTIVACION AUTOMATICA DEL AIRE DADA UNA TEMPERATURA
        controltempestatus:function(d){

           Dispositivos.update({_id:d.id},{$set:{"controltemp.estatus":d.estado}});
          
          
          var dsp = Dispositivos.findOne({_id:d.id});
          console.log(d)
          client.publish('casa/aire/auto',dsp.pin+' '+dsp.controltemp.estatus+' '+dsp.controltemp.temperatura);
        },

        cambiarseguridad:function(d){

          var estado = Programas.findOne({nombre:"seguridad"}).estado;

          if (estado=="off") {
              Programas.update({nombre:"seguridad"},{$set:{"estado":"on"}});
              client.publish('casa/seguridad',"20 on");

              
          } else {
              Programas.update({nombre:"seguridad"},{$set:{"estado":"off"}});
              client.publish('casa/seguridad',"20 off");
              Alerta.remove({tipo:"movimiento"});
          }
        },

        registrotelegram:function(d){
          Telegram.update({codigo:d.codigo},{$inc:{uso:1}});
          //para quitar el campo usar $unset
          Meteor.users.update({ "emails.address" : d.correo},{$set:{"profile.telegram":d.telegram}});
          //enviar mqtt indicando el registro exitoso via el bot de telegram
          client.publish('telegram/exito', d.telegram );
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

          case 'casa/seguridad':
            var mensaje =  message.toString().split(" ");
              if ( mensaje[1]=="alerta" && Programas.findOne({nombre:"seguridad",estado:"on"})) {
                console.log("ALERTA DE INTRUSO")
                Alerta.insert({tipo:"movimiento",activacion:new Date()});
                Historico.update({tipo:"movimiento",zona:Dispositivos.findOne({_id:mensaje[0]}).zona},{$push:{fecha:{fecha:new Date()}}},{upsert:true})
                //Historico.insert({tipo:"movimiento",zona:"zona_x",fecha:new Date()});
                //##### AQUI DECIA ZONA_X.. OJO
              }
              break;

          case 'flame':
          //me avisa que hay flama pero no verifico la veracidad del valor del id
            console.log("ALERTA DE FLAMA")
            var mensaje = message.toString().split(" ");
            if(mensaje[1] == "on"){
              Meteor.call('cambiarValor', {'message1' : mensaje[0], 'message2' : mensaje[1]});
              Alerta.insert({tipo:"flama",zona:Dispositivos.findOne({_id:mensaje[0]}).zona,activacion:new Date(),sensor:mensaje[0]});
              Historico.update({tipo:"flama",zona:Dispositivos.findOne({_id:mensaje[0]}).zona},{$push:{fecha:{fecha:new Date()}}},{upsert:true})

              //Historico.insert({tipo:"flama",zona:Dispositivos.findOne({_id:mensaje[0]}).zona,fecha:new Date()});
            }else if( mensaje[1] == 'off'){
              Meteor.call('cambiarValor', {'message1' : mensaje[0], 'message2' : mensaje[1]});
              Alerta.remove({sensor:mensaje[0]});
            }
            
            break;

          case 'registro':
            console.log("Registro");
            let code = Math.random().toString(36).slice(3);
            mensaje = message.toString().split(" ");
            /*
              debo recibir el id de telegram, y el correo
              enviar el correo de confirmacion y registrar estos datos en la base de datos (datos temporales)
              el entrar al enlace, con el numero de confirmacion, se registra la informacion en la base de datos
            */
            Telegram.insert({id_telegram:mensaje[0],correo:mensaje[1],codigo:code,uso:0});

            Email.send({ to:"wa_p@hotmail.com", from:"jesus.r.montoya@gmail.com", subject:"test", text:"test text with a link http://www.domus.com/"+code });
            break;

          default:
            console.log("entre en el caso default")
        } 
  	
  		//zvD5GuNE2539osYNE sensor llama

}));






bot.onText(/\/start/, (msg, match) => {

  const chatId = msg.chat.id
  const resp = match[1]
  //bot.replyTo(msg.chat,resp);
  //console.log(msg)
  //bot.onReplyToMessage(chatId, msg.message_id, bot.sendMessage(chatId, "Bienvenido a Domusss. \n Escriba su correo para iniciar el registro:")); 
  bot.sendMessage(chatId, "Bienvenido a Domus. \n Escriba su correo para iniciar el registro:",{"reply_to_message_id":msg.message_id,reply_markup: JSON.stringify({ force_reply: true })})

})


bot.onText(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, (msg, match) => {

  const chatId = msg.chat.id
  //const resp = match[1]
  //bot.replyTo(msg.chat,resp);
  bot.sendMessage(chatId, "Le hemos enviado un enlace de confirmación a su correo",{"reply_to_message_id":msg.message_id})
})

/*bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});*/



function getNextID(sec){

    Contador.update({_id: sec },{$inc:{secuencia:1}});
    var s = Contador.findOne({_id: sec });
    
    return s.secuencia.toString();
}




}

