"use strict"

/*
 * 压缩并回复客户端请求模块
 */

var zlib = require("zlib")

module.exports.response = function(req, res, resobj){
	
	// 先压缩数据
	var accept_encoding = req.headers["accept-encoding"]
	if(accept_encoding){
		if(accept_encoding.indexOf("gzip")){
			zlib.gzip(resobj.content, function(err, data){
				if(err){
					console.log("gzip file error:" + req.url)
					send()
				}else{
					resobj.content = data
					resobj.headers["content-length"] = data.length
					resobj.headers["content-encoding"] = "gzip"
					if(req.headers["range"]){
						resobj.code = 206
						range(data)
					}else{
						send()
					}
				}
			})
		}else if(accept_encoding.indexOf("deflate")){
			zlib.deflate(resobj.content, function(err, data){
				if(err){
					console.log("deflate file error:" + req.url)
					send()
				}else{
					resobj.content = data
					resobj.headers["content-length"] = data.length
					resobj.headers["content-encoding"] = "deflate"
					if(req.headers["range"]){
						resobj.code = 206
						range(data)
					}else{
						send()
					}
				}
			})
		}else{
			if(req.headers["range"]){
				resobj.code = 206
				range(resobj.content)
			}else{
				send()
			}
		}
	}else{
		if(req.headers["range"]){
			resobj.code = 206
			range(resobj.content)
		}else{
			send()
		}
	}
	
	// 断点续传
	function range(data){
		var range_arr = req.headers["range"].split("-")
		var start = range_arr[0] || 0
		var end = range_arr[1] || data.length - 1
		resobj.content = data.slice(start, end)
		resobj.header["content-range"] = start + "-" + end + "/" + data.length
		send()
	}
	
	// 发送
	function send(){
		res.writeHead(resobj.code, resobj.headers)
		res.end(resobj.content)
	}
}