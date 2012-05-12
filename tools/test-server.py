#!/usr/bin/env python
import sys
import time
import random

from mimetypes import add_type

add_type('video/ogv', 'ogv', False)
add_type('audio/ogg', 'ogg', False)
add_type('video/webm', 'webm', False)

PORT = 9914
SLOW = False
MAX_SLOW_TIME = .10

def createHandler(ParentClass):
  class SlowHandler(ParentClass):
    def __init__(self, request, client_address, server):
      ParentClass.__init__(self, request, client_address, server)

    def do_HEAD(self):
      return ParentClass.do_HEAD(self)

    def do_GET(self):
      self.headers.headers.append("Cache-Control: no-cache")
      return ParentClass.do_GET(self)

  return SlowHandler

if "--port" in sys.argv:
  PORT = int(sys.argv[sys.argv.index("--port") + 1])

try:
  try:
    import SimpleHTTPServer
    import SocketServer

    Handler = createHandler(SimpleHTTPServer.SimpleHTTPRequestHandler)
    Server = SocketServer.TCPServer

    httpd = Server(("localhost", PORT), Handler)
    print "Web Server listening on http://localhost:%s/ (stop with ctrl+c)..." % PORT
    httpd.serve_forever()

  except ImportError:
    from http.server import HTTPServer, SimpleHTTPRequestHandler

    Handler = createHandler(SimpleHTTPRequestHandler)
    Server = HTTPServer

    httpd = Server(('localhost', PORT), Handler)
    print "Web Server listening on http://localhost:%s/ (stop with ctrl+c)..." % PORT
    httpd.serve_forever()

except BaseException, e:
  print(e)