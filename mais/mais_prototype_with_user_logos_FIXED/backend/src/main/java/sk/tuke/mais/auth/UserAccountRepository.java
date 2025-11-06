package sk.tuke.mais.auth;

import java.util.List;
import java.util.Optional;
import sk.tuke.mais.data.Database;

public class UserAccountRepository {
  private final Database database;

  public UserAccountRepository(Database database) {
    this.database = database;
  }

  public synchronized Optional<UserAccount> findByUsername(String username) {
    return database.getUsers().stream()
        .filter(user -> user.getUsername().equalsIgnoreCase(username))
        .findFirst();
  }

  public synchronized Optional<UserAccount> findById(long id) {
    return database.getUsers().stream()
        .filter(user -> user.getId() == id)
        .findFirst();
  }

  public synchronized List<UserAccount> findAllByRole(Role role) {
    return database.getUsers().stream()
        .filter(user -> user.getRole() == role)
        .toList();
  }

  public synchronized UserAccount save(UserAccount user) {
    if (user.getId() == 0L) {
      user.setId(database.nextUserId());
      database.getUsers().add(user);
    }
    database.save();
    return user;
  }
}
