package sk.tuke.mais.http;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SimpleRouter {
  private final List<Route> routes = new ArrayList<>();

  public void add(String method, String pattern, RouteHandler handler) {
    routes.add(new Route(method.toUpperCase(), pattern, handler));
  }

  public void handle(HttpExchange exchange) throws IOException {
    String method = exchange.getRequestMethod().toUpperCase();
    URI uri = exchange.getRequestURI();
    String path = uri.getPath();
    for (Route route : routes) {
      Map<String, String> params = route.match(method, path);
      if (params != null) {
        route.handler().handle(exchange, params);
        return;
      }
    }
    byte[] body = Json.stringify(Map.of("error", "Not found")).getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
    exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    exchange.sendResponseHeaders(404, body.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(body);
    }
  }

  private record Route(String method, String pattern, RouteHandler handler) {
    Map<String, String> match(String requestMethod, String path) {
      if (!method.equals(requestMethod)) {
        return null;
      }
      String[] routeParts = normalize(pattern).split("/");
      String[] pathParts = normalize(path).split("/");
      if (routeParts.length != pathParts.length) {
        return null;
      }
      Map<String, String> params = new HashMap<>();
      for (int i = 0; i < routeParts.length; i++) {
        String routePart = routeParts[i];
        String pathPart = pathParts[i];
        if (routePart.startsWith(":")) {
          params.put(routePart.substring(1), decode(pathPart));
        } else if (!routePart.equals(pathPart)) {
          return null;
        }
      }
      return params;
    }

    private String normalize(String input) {
      if (input.equals("/")) {
        return "";
      }
      String trimmed = input;
      if (trimmed.startsWith("/")) {
        trimmed = trimmed.substring(1);
      }
      if (trimmed.endsWith("/")) {
        trimmed = trimmed.substring(0, trimmed.length() - 1);
      }
      return trimmed;
    }

    private String decode(String value) {
      return java.net.URLDecoder.decode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
  }
}
