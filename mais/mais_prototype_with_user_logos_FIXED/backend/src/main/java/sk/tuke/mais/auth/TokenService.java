package sk.tuke.mais.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class TokenService {
  private final byte[] secret;

  public TokenService(String secret) {
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
  }

  public String generateToken(UserAccount user, Instant expiresAt) {
    String payload = user.getUsername() + "|" + expiresAt.getEpochSecond();
    String signature = sign(payload);
    String encodedPayload = Base64.getUrlEncoder().withoutPadding()
        .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    return encodedPayload + "." + signature;
  }

  public Optional<TokenPayload> parseToken(String token) {
    String[] parts = token.split("\\.");
    if (parts.length != 2) {
      return Optional.empty();
    }
    String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
    if (!sign(payload).equals(parts[1])) {
      return Optional.empty();
    }
    int sep = payload.lastIndexOf('|');
    if (sep <= 0) {
      return Optional.empty();
    }
    try {
      String username = payload.substring(0, sep);
      long exp = Long.parseLong(payload.substring(sep + 1));
      if (Instant.now().isAfter(Instant.ofEpochSecond(exp))) {
        return Optional.empty();
      }
      return Optional.of(new TokenPayload(username, Instant.ofEpochSecond(exp)));
    } catch (NumberFormatException e) {
      return Optional.empty();
    }
  }

  private String sign(String payload) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret, "HmacSHA256"));
      byte[] sig = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(sig);
    } catch (Exception e) {
      throw new IllegalStateException("Unable to sign token", e);
    }
  }

  public record TokenPayload(String username, Instant expiresAt) {}
}
