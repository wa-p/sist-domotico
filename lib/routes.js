import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Telegram } from '../imports/api/dispositivos.js';

import '../imports/ui/body.js';

Meteor.subscribe('telegram');

FlowRouter.route('/',{
	name: 'home',
	action(){
		BlazeLayout.render('bodys',{index:'principal'});
		
		
	}
});

FlowRouter.route('/config/',{
	name: 'config',
	action(){
		 
		BlazeLayout.render('bodys',{index:'configuracion'});
	}
});

FlowRouter.route('/config/:id',{
	name: 'config',
	action(params){

		 if (params.id=='dispositivo') {
		 	BlazeLayout.render('bodys',{index:'configuracion', config_plate:"configdisp"});
		 } else if (params.id=='permiso'){
		 	BlazeLayout.render('bodys',{index:'configuracion', config_plate:"configpermiso"});
		 } else if (params.id=='auto'){
		 	BlazeLayout.render('bodys',{index:'configuracion', config_plate:"configauto"});
		 } else if (params.id=='aires'){
		 	BlazeLayout.render('bodys',{index:'configuracion', config_plate:"configaires"});
		 }

		
	}
});

FlowRouter.route('/general/',{
	name: 'general',
	action(){
		 
		BlazeLayout.render('bodys',{index:'general'});
	}
});

FlowRouter.route('/general/:id',{
	name: 'general',
	action(params){

		 if (params.id=='eventos') {
		 	BlazeLayout.render('bodys',{index:'general', general_plate:"geneventos"});
		 } else if (params.id=='humedad'){
		 	BlazeLayout.render('bodys',{index:'general', general_plate:"genhumedad"});
		 } 

		
	}
});


FlowRouter.route('/registro/:id', {
	name: 'registro',
	action(params){
		//var client = FlowRouter.getParam("id");
		//console.log(Telegram.findOne({codigo:"yg0gtdx9lw"}));
		//let a = Telegram.find({codigo:client});
			BlazeLayout.render('bodys',{index:'registro'});
	}
    //subscriptions: function(params, queryParams) {
      //  this.register('telgramDB', Meteor.subscribe('telegram', ));
    //}
});



FlowRouter.route('/file',{
	name: 'file',
	action(){
		BlazeLayout.render('bodys',{index:'file'});
		
		
	}
});