"use strict"

/*
 * static-cdn
 *
 * a simple static web server
 *
 * version: 1.0.0
 * author: wallax
 * email: wallax@126.com
 *
 */

var http = require("http")
var mime = require("mimez")
var cli = require("cli2obj")
var path = require("path")
var url = require("url")
var static_info = require("./lib/config.js")
var http_resp = require("./lib/response.js")
var fs = require("fs")

// parse cli args,
// cli usage: node nodinx /root/web 8080

// 注意！！！  网页根路径必须为绝对地址
var clicmd = cli.parseFlat(["root", "port"])

// regexp   test the path which in clicmd.root
var test_path = new RegExp("^" + clicmd.root.replace("/", "\\/"))

// start a http server
if(clicmd.root){
	http.createServer(function(req, res){
		
		// this server only handle GET method
		if(req.method == 'GET'){
			var req_url = url.parse(req.url).pathname
			var req_headers = req.headers
			
			var response_obj = {
				"code": 200,
				"headers": {
					"server": "Nodinx/1.0.0"
				},
				"content": ""
			}
			
			var file_url = path.join(clicmd.root, req_url.slice(1))
			console.log(file_url)
			if(test_path.test(file_url)){
				
				fs.exists(file_url, function(e){
					if(e){
						fs.stat(file_url, function(err, stat){
							if(err){
								// 500 internal server error
								response_obj.code = 500
								response_obj.content = static_info.http_500
								response_obj.headers["content-type"] = "text/html"
								
								http_resp.response(req, res, response_obj)
							}
							
							if(stat.isDirectory()){
								
								// if this path is directory, get the default file
								var defaults = static_info.default
								
								// pass to nexttick
								process.nextTick(function(){
									for(var i = 0; i < defaults.length; i++){
										var dir_def_file = file_url  + defaults[i]
										if(!fs.existsSync(dir_def_file)) continue
										var def_stat = fs.statSync(dir_def_file)
										
										if(def_stat.isFile()){
											fs.readFile(dir_def_file, function(err, data){
												if(err){
													
													// 500
													response_obj.code = 500
													response_obj.content = static_info.http_500
													response_obj.headers["content-type"] = "text/html"
													
													http_resp.response(req, res, response_obj)
												}else{
													
													// send file
													response_obj.code = 200
													response_obj.content = data
													response_obj.headers["content-type"] = mime.path(file_url)
													
													http_resp.response(req, res, response_obj)
												}
											})
											
											return
										}
									}
									
									// 403
									response_obj.code = 403
									response_obj.content = static_info.http_403
									response_obj.headers["content-type"] = "text/html"
									
									http_resp.response(req, res, response_obj)
								})
							}else if(stat.isFile()){
								fs.readFile(file_url, function(err, data){
									if(err){
										
										// 500
										response_obj.code = 500
										response_obj.content = static_info.http_500
										response_obj.headers["content-type"] = "text/html"
										
										http_resp.response(req, res, response_obj)
									}else{
										
										// send file
										response_obj.code = 200
										response_obj.content = data
										response_obj.headers["content-type"] = mime.path(file_url)
										
										http_resp.response(req, res, response_obj)
									}
								})
							}
						})
					}else{
						
						// 404
						response_obj.code = 404
						response_obj.content = static_info.http_404
						response_obj.headers["content-type"] = "text/html"
						
						http_resp.response(req, res, response_obj)
					}
				})
			}
		}
	})
	
	// if not set the port, the default is 80
	.listen(clicmd.port || 80)
}else{
	console.log("no root dir, exiting...")
	process.exit(-1)
}