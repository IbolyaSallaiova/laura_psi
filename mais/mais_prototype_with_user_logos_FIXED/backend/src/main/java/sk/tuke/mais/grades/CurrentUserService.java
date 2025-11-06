package sk.tuke.mais.grades;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import sk.tuke.mais.auth.Role;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.auth.UserAccountRepository;

@Component
public class CurrentUserService {
    private final UserAccountRepository userAccountRepository;

    public CurrentUserService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserAccount requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Neprihlásený používateľ");
        }
        String username = authentication.getName();
        return userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Používateľ neexistuje"));
    }

    public UserAccount requireTeacher() {
        UserAccount user = requireUser();
        if (user.getRola() != Role.TEACHER || user.getTeacherId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vyžaduje sa rola učiteľa");
        }
        return user;
    }

    public UserAccount requireStudent() {
        UserAccount user = requireUser();
        if (user.getRola() != Role.STUDENT || user.getStudentId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vyžaduje sa rola študenta");
        }
        return user;
    }
}
