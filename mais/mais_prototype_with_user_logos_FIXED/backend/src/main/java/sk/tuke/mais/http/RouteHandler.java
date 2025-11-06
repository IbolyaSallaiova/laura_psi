package sk.tuke.mais.http;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.util.Map;

@FunctionalInterface
public interface RouteHandler {
  void handle(HttpExchange exchange, Map<String, String> params) throws IOException;
}
