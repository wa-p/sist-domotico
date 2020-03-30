import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating';
import { Dispositivos } from '../api/dispositivos.js';
import { Permisos } from '../api/dispositivos.js';
import { Admin } from '../api/dispositivos.js';
import { Rutinas } from '../api/dispositivos.js';
import { Pin } from '../api/dispositivos.js';
import { TipoDisp } from '../api/dispositivos.js';
import { Programas } from '../api/dispositivos.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import { Alerta } from '../api/dispositivos.js';
import { Historico } from '../api/dispositivos.js';
//import { FlowRouter } from 'meteor/kadira:flow-router';
import './bodys.html';
import '../../client/layouts/MainLayout.html';

clientZona = new Mongo.Collection('clientZona');



// CLAVE SERVIDOR      AAAA6qbCzgs:APA91bGmxq_pVmXoT2c0m_D-10eBne0nAsKihtrc4ZqAv-s_zLiqfpUGf-OOL6pvvKHOUGDN2L607TpffGfI-thzV4ji_abmpdgZGSdty3xSP1nyDyvXJDUhr9EUo9diBN-wnzvjJ5MT

//CLAVE SERVIDOR HEREDADA   AIzaSyBp_rnlPVcQhAuqTFGMZVa6gZFoIAX3z-E

// SENDER ID    1007820131851



Template.body.onCreated(function bodyOnCreated() {

  this.state = new ReactiveDict();
  Session.set('zona_actual',null);
  Session.set('rutina_editar',null);

  Meteor.subscribe('dispositivos');
  Meteor.subscribe('zonas');
  Meteor.subscribe('user');
  Meteor.subscribe('permisos');
  Meteor.subscribe('admin');
  Meteor.subscribe('rutinas');
  Meteor.subscribe('pin');
  Meteor.subscribe('tipodispositivo');
  Meteor.subscribe('aires');
  Meteor.subscribe('programas');
  Meteor.subscribe('alertas');
  Meteor.subscribe('eventos');


});

Tracker.autorun(function () {
      var flama = Alerta.findOne({tipo:"flama"});
      var movimiento = Alerta.findOne({tipo:"movimiento"});
        if( movimiento ) {
          // Execute a modal popup or something - make sure to pass the current value.
          // Call a meteor method to remove the notification.
          
          $( ".light-blue" ).removeClass( "light-blue" ).addClass( "red" );
                 
          $('#modalwarning').modal('open');
        }else{

          $( ".red" ).removeClass( "red " ).addClass( "light-blue" ); 
        };

        //SECCION FLAMA
        if (flama) {
          $('#fuego_'+flama.zona).addClass('blink');
          $('#fuego_'+flama.zona).css("display","inline");
          Materialize.toast('Alerta de FLAMA en '+flama.zona); 

        }else{
          $('.toast').hide();
          $('.fuego_icon').removeClass('blink');
          $('.fuego_icon').css("display","none");
        };


   });


Template.bodys.helpers({
	admin: function (a) {
    	// body...
    	if (Admin.findOne({usuario:a})!=null){
    		return true;
    	}else{
    		return false;
    	}
    },


  programas() {

    return Programas.findOne({nombre:"seguridad"})

  },

  equals: function(a, b) {
        return a == b;
    },

    alertas() {
    var notification = Alerta.findOne();
    if( notification ) {
      // Execute a modal popup or something - make sure to pass the current value.
      // Call a meteor method to remove the notification.
      alert("body")
    }
  },

   

});

 Template.bodys.onRendered(function () {
        
        $('.collapsible').collapsible();
        $('.sidenav').sidenav();
        $('.modal').modal();
        $('.tap-target').tapTarget();
        
        
      }); 

 Template.bodys.events({
       'click .side-nav li > a':function(e){
       		
       	$('.button-collapse').trigger("click");
       },

        'click .icono_seguridad':function(e){

          Meteor.call('cambiarseguridad',{});
          
          if(Programas.findOne({nombre:"seguridad"}).estado == "off"){
              Materialize.toast('Se ha activado la seguridad');    
          }else{
            Materialize.toast('Se ha desactivado la seguridad');
          }

          setTimeout(
        function() 
        {
           $('.toast').hide();
       
        }, 3000);
        
       }  
       

        
        
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
    },

     alertas() {
    var notification = Alerta.findOne();
    if( notification ) {
      // Execute a modal popup or something - make sure to pass the current value.
      // Call a meteor method to remove the notification.
      alert("body")
    }
  }


});


Template.configuracion.events({
	


	//SUBMIT DEL FORMULARIO DE NUEVOS DISPOSITIVOS
  'submit #new-disp'(event) {

    // Prevent default browser form submit

    event.preventDefault();
    // Get value from form element

    const target = event.target;
    console.log(parseInt(target.pin.value));
    var pin_actual= Pin.find({pin:parseInt(target.pin.value)}).fetch()[0]
    
    if (pin_actual.estado=='libre'){

    	Meteor.call('newdisp',{ "nombre":target.nombre.value,
							"zona":target.zona.value,
							"tipo":target.tipo.value,		   
							"icono":target.icono.value,
              "especifico":target.especifico.value,
							"pin":target.pin.value,
							"valor":0,
		   					"unidad":"unidades",
		   					"id":pin_actual._id, 
							});

	
		$('.modal').modal('close', "#modal_agregar_dispositivo");
   		Materialize.toast('Agregado satisfactoriamente');
   		$('#pin_ocupado').hide();
   		
   		$("#new-disp").trigger("reset");


    }else{

    	var libre = Pin.find({estado:'libre'},{_id:0,pin:1}).fetch()
    	var text = "Pin ocupado... Estos ";
    	for (x in libre){
    		text += libre[x].pin + ","
    		//console.log(libre[x].pin)	
    	}
    	text = text + " estan libres";
    	//$('#pin_ocupado').setText("Pin ocupado... Estos "+text+" estan libres");
    	//$('#pin_ocupado').show();
    	 //M.toast({html: 'I am a toast!', classes: 'rounded'});
    	 //$('.modal').modal('close', "#modal_agregar_dispositivo");
    	//Materialize.toast('Pin ocupado... Estos '+text+' estan libres');
    	$('#pin_label').attr('data-error', text);  
    	$('#pin').addClass("invalid");
    	console.log(text)
    }
    //Verificar que pin esta disponible
    //si esta disponible, agregarlo
    //si no, devolver un array con la lista de disponibles.
    /*

    
    Caracas Avenida Norte, esq.Mijares, Edificio Insbanca, piso 6, oficina 66, Urbanización Altagracia, Distrito Capital (punto de referencia: al lado del Banco Central de Venezuela) 58 2128627723

    */

	<button class="btn light-blue lighten-1" type="submit" name="action" form="new-auto">Guardar
                      <i class="material-icons right">send</i>
        </button>

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
 

    // Clear form

    
	

	
	
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
  var esp = event.target.getAttribute("data-especifico");
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
  Meteor.call('prender', {'ide' : id, 'estado' : estado, 'especifico' : esp});
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
			//console.log(event.target);
			$('a').removeClass("active");
            $(event.target).addClass("active");
	//console.log(event.target.getAttribute("data-zona") +" zona evento" )
	


},

'click .cambiar':function(event){
  var id = event.target.getAttribute("data-id");
  var accion = event.target.getAttribute("data-accion");
   
        Meteor.call('cambiartempaire', {'id' : id, 'accion': accion });
   
    
  },

  


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



// #####################################
//  CONFIGURACION DE DISPOSITIVOS      #
// #####################################

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

    pin() {
    	return Pin.find();
    },

    tipodispos(){
       var array = TipoDisp.find().fetch()

      for (var i = 0; i < array.length; i+=1) {
        //console.log("En el índice '" + i + "' hay este valor: " + array[i].valor);
        
        $('#especifico').append("<option value='"+array[i].valor+"'>"+array[i].valor+"</option>");
      }
    $('select').material_select();
      //var opt = document.createElement('option');
    //opt.value = i;
    //opt.innerHTML = i;
    //select.appendChild(opt);

      return TipoDisp.find({}).fetch();

    }

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

 

 //  ################################
 //  #  AUTOMATIZACION DE PROCESOS  #
 //  ################################


 Template.configauto.onRendered(function () {
        $('select').material_select();
        $('.modal').modal();
        $('.collapsible').collapsible();
        $('.tooltipped').tooltip();
        $('.datepicker').datepicker();
        $('.timepicker').timepicker();
        
      });

 Template.configauto.helpers({
	 dispositivos() {

    return Dispositivos.find({tipo:"actuador"});

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
    rutinas(){
    	return Rutinas.find();
    },
    espacio: function(a){
    	
    	return a.toString().replace(/,/g , ', ');
    },
    fecha: function(a){
    	var b = a.split("-");
    	return b[2]+"/"+b[1]+"/"+b[0];
    },
    hora: function(a){
    	var b = a.split(":");
    	var c=0;
    	var d = "A.M";

    	if (parseInt(b[0],10) > 12){
    		c = parseInt(b[0])-12;
    		d = "P.M";
    	}else{
    		c = parseInt(b[0]);
    	}

    	if (parseInt(b[0],10) == 12){
    		 d = "P.M";
    	}
    	return c +":"+b[1]+" "+d;
    },
    estatus: function(a){
    	if (a=="activa"){
    		return "green-text";
    	}else if(a=="inactiva"){
    		return "red-text";
    	}
    },

    freq: function(a){
    	return (Rutinas.find({frecuencia:a}).count() >= 1);
    },

    disp_auto_check: function(a){
    	var rutina = Rutinas.findOne({_id:Session.get('rutina_editar')});
    	return rutina.dispositivos.includes(a);
    }


});


 Template.configauto.events({
	


	//SUBMIT DEL FORMULARIO DE NUEVAS RUTINAS
  'submit #new-auto'(event) {

    // Prevent default browser form submit

	    event.preventDefault();
	    // Get value from form element

	    const target = event.target;

	    var frecuencia="";
	    var dispositivos ="";

	    //DIAS SELECCIONADOS
		 $("#new-auto input.dia:checkbox:checked").each(function() {
		     
		      frecuencia = frecuencia+ $(this).attr("value")  + " "  ;
		});

		 		frecuencia = $.trim(frecuencia);
		//DIAS SELECCIONADOS
		 $("#new-auto input.dispositivo_auto:checkbox:checked").each(function() {
		     
		      dispositivos = dispositivos + $(this).attr("name") + " ";
		});
		 	dispositivos = $.trim(dispositivos);

	  
		Meteor.call('newauto',{ "nombre":target.nombre.value,
								//"fecha_inicio":target.fecha_inicio.value,
								//"fecha_fin":target.fecha_fin.value,		   
								"hora_encendido":target.hora_encendido.value,
								"hora_apagado":target.hora_apagado.value,
								"frecuencia":frecuencia,
			   					"dispositivos":dispositivos, 
								});

		
		$('.modal').modal('close', "#modal_agregar_auto");
	   	Materialize.toast('Creada satisfactoriamente');

			setTimeout(
				  function() 
				  {
				     $('.toast').hide();
				 
				  }, 3000);
	 

	    // Clear form

	    
		$("#new-auto").trigger("reset");

	
	
  },

//SUBMIT DEL FORMULARIO DE EDITAR RUTINAS
   'submit #edit-auto'(event) {

    // Prevent default browser form submit

    event.preventDefault();
    // Get value from form element

    const target = event.target;

    var frecuencia="";
    var dispositivos ="";

	    //DIAS SELECCIONADOS
	 $("#edit-auto input.dia:checkbox:checked").each(function() {
	     
	      frecuencia = frecuencia+ $(this).attr("name")  + " "  ;
	});

	 		frecuencia = $.trim(frecuencia);
	//DIAS SELECCIONADOS
	 $("#edit-auto input.dispositivo_auto:checkbox:checked").each(function() {
	     
	      dispositivos = dispositivos + $(this).attr("name") + " ";
	});
	 	dispositivos = $.trim(dispositivos);

   
   	

    
	Meteor.call('editauto',{"id":target.id.value,
							"nombre":target.nombre.value,
							"hora_encendido":target.hora_encendido.value,
							"hora_apagado":target.hora_apagado.value,
							"frecuencia":frecuencia,
		   				"dispositivos":dispositivos, 
							});
							

	$('.modal').modal('close', "#modal_editar_auto");

	$('#edit-auto').trigger("reset");

   	Materialize.toast('Editado satisfactoriamente');

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
 

    // Clear form

    
	//document.getElementById("new-disp").reset();
	


	},
	//ELIMINAR AUTOMATIZACION
	'click .eliminar_auto':function(event){
		
		var a = event.target.getAttribute("data-id");
		
		Meteor.call('eliminarauto',{id:a});
		document.getElementById("auto_"+a).remove();
		Materialize.toast('Eliminado satisfactoriamente');

		setTimeout(
			  function() 
			  {
			     $('.toast').hide();
			 
			  }, 3000);
	},

	//MODIFICAR RUTINA
	'click .editar_auto':function(event){
		
		var a = event.target.getAttribute("data-id");
		Session.set('rutina_editar',a);
		var rutina = Rutinas.findOne({_id:a});

		$('#edit_nombre_rutina').val(rutina.nombre);
		$('#edit_nombre_rutina').siblings('label, .prefix').addClass('active');
		$('#edit_fecha_inicio').val(rutina.fecha_inicio);
		$('#edit_fecha_fin').val(rutina.fecha_fin);
		$('#edit_hora_encendido').val(rutina.hora_encendido);
		$('#edit_hora_apagado').val(rutina.hora_apagado);
		
		if(rutina.frecuencia.includes("1")){
			$("#edit_lunes").prop("checked", true);
		}

		if(rutina.frecuencia.includes("2")){
			$("#edit_martes").prop("checked", true);	
		}

		if(rutina.frecuencia.includes("3")){
			$("#edit_miercoles").prop("checked", true);
		}

		if(rutina.frecuencia.includes("4")){
			$("#edit_jueves").prop("checked", true);
		}

		if(rutina.frecuencia.includes("5")){
			$("#edit_viernes").prop("checked", true);
		}

		if(rutina.frecuencia.includes("6")){
			$("#edit_sabado").prop("checked", true);
		}

		if(rutina.frecuencia.includes("7")){
			$("#edit_domingo").prop("checked", true);
		}

		


		//var dsp = Dispositivos.findOne({_id:a});
		/*$('#edit_nombre').val(dsp.nombre);
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
		*/
		$('#boton_modal_editar_auto')[0].click();
		
		
	},

	'change .cambio-estatus': function(event) {
  var x = event.target.checked;
  //Session.set("statevalue", x);
  //console.log(event.target.checked);
 
  var id = event.target.getAttribute("data-id");
  
  

  if (x==true) {
  	//mensaje=event.target.id  + " on";
  	Meteor.call('cambioestatus', {'id' : id, 'estado' : 'activa'});
  } else{
  	Meteor.call('cambioestatus', {'id' : id, 'estado' : 'inactiva'});
  }
  //console.log(mensaje)
  //Dispositivos.update({"_id":id},{$set: {"estado":estado,"update":new Date()}});
  
 },





  
});


//****************
//CONFIGURACION DE AIRES
//R*******************

Template.configaires.helpers({

    tipodispos(){     

      return TipoDisp.find();

  },

  aires(){
    return Dispositivos.find({'especifico':'air'})
  },

   equals: function(a, b) {
        return a == b;
      }

});


Template.configaires.events({

  'change .controltemp-estatus': function(event) {
  var x = event.target.checked;
  //Session.set("statevalue", x);
  //console.log(event.target.checked);
 
  var id = event.target.getAttribute("data-id"); 
  

  if (x==true) {
    //mensaje=event.target.id  + " on";
    Meteor.call('controltempestatus', {'id' : id, 'estado' : 'activa'});
  } else{
    Meteor.call('controltempestatus', {'id' : id, 'estado' : 'inactiva'});
  }
  //console.log(mensaje)
  //Dispositivos.update({"_id":id},{$set: {"estado":estado,"update":new Date()}});
  
 },

 'click .cambiar':function(event){
  var id = event.target.getAttribute("data-id");
  var accion = event.target.getAttribute("data-accion");
   
        Meteor.call('controltempvalor', {'id' : id, 'accion': accion });
   
    
  },

});


//###########################
//    TEMPLATE GENERAL
//###########################

Template.geneventos.helpers({

  eventos(){
    return  Historico.find({tipo:"flama"}); 
  },

  fecha(f){
    date = new Date(f);
    return date.toLocaleString();
  }

});


/*

 $project : {
                sensor: "$nombre",
                avg : {$avg : "$fecha.valor"}
            }

*/

Template.genhumedad.helpers({
  
  humedad() {

  return Historico.find({tipo:"sensor"}); 
  },

  fecha(f){
    date = new Date(f);
    return date.toLocaleString();
  }

});