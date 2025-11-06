package sk.tuke.mais.util;

import java.io.Serializable;

public class IdGenerator implements Serializable {
  private long current;

  public IdGenerator(long start) {
    this.current = start;
  }

  public synchronized long next() {
    return ++current;
  }

  public synchronized long getCurrent() {
    return current;
  }
}
