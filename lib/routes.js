import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../imports/ui/body.js';


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
		 }
		
	}
});