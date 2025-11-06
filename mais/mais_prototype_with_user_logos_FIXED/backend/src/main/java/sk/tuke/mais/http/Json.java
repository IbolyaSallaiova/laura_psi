package sk.tuke.mais.http;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Json {
  private Json() {}

  public static Object parse(String json) {
    return new Parser(json).parseValue();
  }

  public static Map<String, Object> parseObject(String json) {
    Object value = parse(json);
    if (value instanceof Map<?, ?> map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> result = (Map<String, Object>) map;
      return result;
    }
    throw new IllegalArgumentException("Not a JSON object");
  }

  public static String stringify(Object value) {
    StringBuilder builder = new StringBuilder();
    writeValue(builder, value);
    return builder.toString();
  }

  private static void writeValue(StringBuilder builder, Object value) {
    if (value == null) {
      builder.append("null");
    } else if (value instanceof String s) {
      builder.append('"').append(escape(s)).append('"');
    } else if (value instanceof Number || value instanceof Boolean) {
      builder.append(value);
    } else if (value instanceof Map<?, ?> map) {
      builder.append('{');
      boolean first = true;
      for (Map.Entry<?, ?> entry : map.entrySet()) {
        if (!first) {
          builder.append(',');
        }
        first = false;
        builder.append('"').append(escape(entry.getKey().toString())).append('"').append(':');
        writeValue(builder, entry.getValue());
      }
      builder.append('}');
    } else if (value instanceof Iterable<?> iterable) {
      builder.append('[');
      boolean first = true;
      for (Object item : iterable) {
        if (!first) {
          builder.append(',');
        }
        first = false;
        writeValue(builder, item);
      }
      builder.append(']');
    } else {
      builder.append('"').append(escape(String.valueOf(value))).append('"');
    }
  }

  private static String escape(String input) {
    StringBuilder sb = new StringBuilder();
    for (char c : input.toCharArray()) {
      switch (c) {
        case '\\' -> sb.append("\\\\");
        case '"' -> sb.append("\\\"");
        case '\n' -> sb.append("\\n");
        case '\r' -> sb.append("\\r");
        case '\t' -> sb.append("\\t");
        default -> sb.append(c);
      }
    }
    return sb.toString();
  }

  private static final class Parser {
    private final String json;
    private int index;

    private Parser(String json) {
      this.json = json;
    }

    private Object parseValue() {
      skipWhitespace();
      if (index >= json.length()) {
        throw new IllegalArgumentException("Unexpected end of JSON");
      }
      char c = json.charAt(index);
      return switch (c) {
        case '{' -> parseObject();
        case '[' -> parseArray();
        case '"' -> parseString();
        case 't' -> parseLiteral("true", Boolean.TRUE);
        case 'f' -> parseLiteral("false", Boolean.FALSE);
        case 'n' -> parseLiteral("null", null);
        default -> parseNumber();
      };
    }

    private Map<String, Object> parseObject() {
      Map<String, Object> map = new LinkedHashMap<>();
      expect('{');
      skipWhitespace();
      if (peek('}')) {
        expect('}');
        return map;
      }
      while (true) {
        String key = parseString();
        skipWhitespace();
        expect(':');
        Object value = parseValue();
        map.put(key, value);
        skipWhitespace();
        if (peek('}')) {
          expect('}');
          break;
        }
        expect(',');
        skipWhitespace();
      }
      return map;
    }

    private List<Object> parseArray() {
      List<Object> list = new ArrayList<>();
      expect('[');
      skipWhitespace();
      if (peek(']')) {
        expect(']');
        return list;
      }
      while (true) {
        Object value = parseValue();
        list.add(value);
        skipWhitespace();
        if (peek(']')) {
          expect(']');
          break;
        }
        expect(',');
        skipWhitespace();
      }
      return list;
    }

    private String parseString() {
      expect('"');
      StringBuilder sb = new StringBuilder();
      while (index < json.length()) {
        char c = json.charAt(index++);
        if (c == '"') {
          break;
        }
        if (c == '\\') {
          if (index >= json.length()) {
            throw new IllegalArgumentException("Invalid escape sequence");
          }
          char escape = json.charAt(index++);
          switch (escape) {
            case '"' -> sb.append('"');
            case '\\' -> sb.append('\\');
            case '/' -> sb.append('/');
            case 'b' -> sb.append('\b');
            case 'f' -> sb.append('\f');
            case 'n' -> sb.append('\n');
            case 'r' -> sb.append('\r');
            case 't' -> sb.append('\t');
            case 'u' -> {
              if (index + 4 > json.length()) {
                throw new IllegalArgumentException("Invalid unicode escape");
              }
              String hex = json.substring(index, index + 4);
              index += 4;
              sb.append((char) Integer.parseInt(hex, 16));
            }
            default -> throw new IllegalArgumentException("Invalid escape: " + escape);
          }
        } else {
          sb.append(c);
        }
      }
      return sb.toString();
    }

    private Object parseNumber() {
      int start = index;
      if (peek('-')) {
        index++;
      }
      while (index < json.length() && Character.isDigit(json.charAt(index))) {
        index++;
      }
      if (peek('.')) {
        index++;
        while (index < json.length() && Character.isDigit(json.charAt(index))) {
          index++;
        }
      }
      String number = json.substring(start, index);
      if (number.isEmpty() || number.equals("-")) {
        throw new IllegalArgumentException("Invalid number");
      }
      if (number.contains(".")) {
        return Double.parseDouble(number);
      }
      return Long.parseLong(number);
    }

    private Object parseLiteral(String literal, Object value) {
      if (json.startsWith(literal, index)) {
        index += literal.length();
        return value;
      }
      throw new IllegalArgumentException("Unexpected token");
    }

    private void expect(char c) {
      if (index >= json.length() || json.charAt(index) != c) {
        throw new IllegalArgumentException("Expected '" + c + "'");
      }
      index++;
    }

    private boolean peek(char c) {
      return index < json.length() && json.charAt(index) == c;
    }

    private void skipWhitespace() {
      while (index < json.length() && Character.isWhitespace(json.charAt(index))) {
        index++;
      }
    }
  }
}
