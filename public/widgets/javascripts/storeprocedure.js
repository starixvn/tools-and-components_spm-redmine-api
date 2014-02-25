var storeprocedure = window.storeprocedure = (function(){
	var grid = null, 
		isWidgets = !(window === window.parent),
		refreshPeriod = 10000,
		loadTimer = 0,
		source = null, 
		data = [], 
		newData = null,
		selectLimit = 10,
		httpQueries = {},
		setup = function(){},
		refresh = function(){},
		save = function(){};
	
	// Parsing parameters
	(window.onpopstate = function () {
	    var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = window.location.search.substring(1);
	
	    httpQueries = {};
	    while (match = search.exec(query))
	       httpQueries[decode(match[1])] = decode(match[2]);
	})();

	load = _.debounce(function() {		
		stopPolling();		
		$.ajax({url:"storeprocedure.json", async: false, success:function(result) {
			
			startPolling();
			
			if(!result.err) {
				var newSource = JSON.parse(result);
				
				// Same data
				if(source && _.isEqual(newSource.data, source.data)) {
					return;
				}
				
				source = newSource;
				if(newData == null) {
					data = newData = source.data;
				}
				else {
					newData = source.data;
				}
															
				_.each(data, function(e, i, list) {
					
					if(e == null || e.Id === 0) return;
					
					var existedItem = _.find(newData, function(newDataItem){ 
						return (newDataItem.Id === e.Id);
					});
					
					if(existedItem) {
						// Update existed
						data[i] = existedItem;
					}
					else {
						if(e && !isNaN(e.Id + "")) {
							// Delete
							data[i] = null;
						}
					}
				});	
				
				// Insert new items
				_.each(newData, function(e, i, list) {
					
					if(e && e.Name === "") {
						return;
					}
					
					var existedItem = _.find(data, function(dataItem){ return dataItem && dataItem.Id === e.Id;});
					
					if(!existedItem) {
						if(!data[data.length - 1].Name) {
							data.splice(data.length - 1, 1, e);
						}
						else {
							data.push(e);
						}
					}
				});
				
				if(data.length > 1) {
					_.each(data, function(e, i, list) {
						if(e && e.Id === 0) {
							data[i] = null;
							return;
						}
					});
				}						
				
				data = _.compact(data);						
				
				// Bind data to existing grid
				if(grid) {
					grid.data('handsontable').loadData(data);
				}
			}
	  	}});
	}, 50);
	
	function startPolling() {
		stopPolling();
		loadTimer = setInterval(load, refreshPeriod);
	};
	
	function stopPolling() {
		if(loadTimer !== 0) {
			clearInterval(loadTimer);
		}
		loadTimer = 0;
	};
	
	// Set object property by path
	_.mixin({
	  assign: function(obj, prop, value) {
		    if (typeof prop === "string") {
		        prop = prop.split(".");
		    }
		
		    if (prop.length > 1) {
		        var e = prop.shift();
		        obj[e] = _(Object.prototype.toString.call(obj[e]) === "[object Object]"
		                 ? obj[e]
		                 : {}).assign(prop, value);
		    } else {
		        obj[prop[0]] = value;
		    }
		    
		    return obj;
		}
	});
	
	// Filter for servers, databases, devs autocomplete
	function filterSelect(array, q, p) {
		var regex = new RegExp(q, "i");
		var found = _.filter(array, function(e){
	
			return regex.test(e);
		});
		
		var limit = found.slice(0, selectLimit - 1);
		if(found.length > selectLimit) {
			limit.push("...");
		};
		
		p(limit);
	};
	
	function getAuthor() {
		
		return (_.find(source.devs, function(dev){
				return dev.name === atob(httpQueries.author);
			}) || {name: ""}).name;
	}
	
	function del(e) {			
		
		var id = e.Id || 0;
		if(id == 0 || isNaN(id)){ 
			return;
		}				
		
		$.ajax({
			url:"/storeprocedure/" + id, 
			async: true,
			method: "DELETE",
			success:function(result){
				load();
				startPolling();
	  		}
	  	});
	}
	
	function insert_or_update(e, index) {
		
		if(!e.Name) {
			return;
		}
	
		if(!e.ActionName) {
			return;
		}
	
		if(!e.StatusName) {
			return;
		}
	
		if(!e.Developer || !e.Developer.Username) {
			return;
		}			
		
		// Resolve id from name
		if(e.Server) {
			e.Server.Id = (_.find(source.servers, function(server){
				return $.trim(server.name) === $.trim(e.Server.Name);
			}) || {}).id;
		}
		else {
			return;
		}
		
		if(e.Database) {
			e.Database.Id = (_.find(source.databases, function(database) {
				return $.trim(database.name) === $.trim(e.Database.Name) && database.serverId === e.Server.Id;
			}) || {}).id;
		}
		else {
			return;
		}
		
		e.Status = (_.find(source.sp_statuses, function(status){
			return $.trim(status.name) === $.trim(e.StatusName);
		}) || {}).id;
		
		if(e.Developer) {
			e.Developer.Id = (_.find(source.devs, function(dev){
				return $.trim(dev.name) === $.trim(e.Developer.Username);
			}) || {}).id;
		}
		else {
			e.Developer = {};
		}
		
		var d = [
			'id=' + e.Id, 
			'serverId=' + e.Server.Id, 
			'databaseId=' + e.Database.Id, 
			'name=' + $.trim(e.Name || ""), 
			'isFunction=' + (e.IsFunction || false), 
			'actionName=' + $.trim(e.ActionName || ""),
			'modifiedBy=' + $.trim(getAuthor()),
			'status=' + e.Status,
			'description=' + $.trim(e.Description || ""),
			'issueId=' + source.issueId,
			'developerId=' + (e.Developer.Id || 0)
		];
		
		$.ajax({
			url:"/storeprocedure?" + d.join('&'), 
			async: true,
			method: "POST",
			success:function(result){
				if(!isNaN(result + "") && result != 0) { // Insert success
					if(data[index].Id  === 0 || data[index].Id  === undefined || data[index].Id  === null) {
						e.Id = data[index].Id = parseInt(result);
					}
				}
				else {
					notify(result);
				}
				
				load();
				
				startPolling();
	  		}
	  	});
	}
	
	function notify(msg) {
		console.log(msg);
	}
	
	// Modify newData object
	function onChange(change) {
		stopPolling();
		
		_.each(change, function(e, index, list){
			// [row, binding, null, value]
			var change = jQuery.extend(true, {}, e);
			var insert = !data[e[0]];
			var row = _(data[e[0]] || {}).assign(e[1], e[3]);
			
			if(!_.isEqual(e[2], e[3])){
				data[e[0]] = row;
				insert_or_update(data[e[0]], e[0]);						
			}
		});
	}
	
	setup = _.debounce(function(){
		grid = $("#storeprocedures").handsontable({
		  data: data,
		  startRows: 0,
		  minSpareRows: 1,
		  contextMenu: ['remove_row', "hsep3", "undo", "redo"],
		  manualColumnResize: true,
		  columnSorting: false,
		  persistentState: true,
		  colWidths: [110, 115, 230, 75, 65, 105, 100, 150, 120],
		  colHeaders: ["Server", "Database", "SP/Function", "Is Function", "Action", "Developer", "Status", "Description", "Modified by"],
		  columns: [
		    {
		      type: 'autocomplete',
		      source:  function(q, p) {		      		
					filterSelect(_.map(source.servers, function(e){ 
						return e.name;
						}), q, p);
			  },
			  data: "Server.Name",
		      allowInvalid: false			      
		    },
		    {
		      type: 'autocomplete',
		      source:  function(q, p) {		      	
		      		// Filter database by serverId
		      		var instance = $('#storeprocedures').handsontable('getInstance');
		      		var pos = instance.getSelected();
		      		var serverName = instance.getDataAtCell(pos[0], pos[1] - 1);
		      		
		      		var serverId = (_.find(source.servers, function(server){
						return $.trim(server.name) === $.trim(serverName);
					}) || {}).id;
					
		      		var reduce = _.filter(source.databases, function(database){ 
		      			return database.serverId === serverId;
		      			});
		      		
		      		if(reduce.length === 0) {
		      			reduce = source.databases;
		      		}
		      		
					filterSelect(_.map(reduce, function(e){ 
						return e.name;
						}), q, p);
			  },
			  data: "Database.Name",
		      allowInvalid: false
		    },
			{ 
				type: 'text',
				data: "Name"
			},
			{ 
				type: 'checkbox',
				data: "IsFunction"
			},
			{
				type: 'autocomplete',
				source: source.sp_actionTypes,
				data: "ActionName",
				strict: true,
				filter: true
			},
			{
				type: 'autocomplete',
		        source:  function(q, p) { 
					filterSelect(_.map(source.devs, function(e){ return e.name;}), q, p);
			    },
			    data: "Developer.Username"
			},
			{
				type: 'autocomplete',
				source: _.map(source.sp_statuses, function(e){ return e.name;}),
				data: "StatusName",
				strict: true,
				filter: true
			},
			{ 
				type: 'text',
				data: "Description"					
			},
			{ 
				type: 'text', 
				data: "Modifier.Username",
				readOnly: true
			}    
		  ],
		  afterChange: function (change, source) {
			    if (source === 'loadData') {
			      return; //don't save this change
			    }
			    // Insert or update
			    onChange(change);
		  },
		  afterRemoveRow: function (index, amount) {
		  		var start = index;				  		
			  			
			  	stopPolling();
		  		while(start < amount + index) {
		  			if(newData.length > start) {
		  				del(newData[start]);
		  			}
		  			start++;
		  		}						
		  }
		});
		
		$('#storeprocedures table').addClass('table table-hover table-striped table-bordered');				

	}, 100);
	
	return {
		name: "", 
		config: function(options) {
			selectLimit = selectLimit | options.selectLimit;
			isWidgets = isWidgets | options.isWidgets;
		},
		load: function(){
			load();
			setup();
			startPolling();
		}
	};
})();