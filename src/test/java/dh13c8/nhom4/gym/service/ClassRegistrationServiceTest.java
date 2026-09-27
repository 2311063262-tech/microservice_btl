package dh13c8.nhom4.gym.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import dh13c8.nhom4.gym.entity.ClassRegistration;
import dh13c8.nhom4.gym.entity.ClassSession;
import dh13c8.nhom4.gym.repository.ClassRegistrationRepository;

@ExtendWith(MockitoExtension.class)
class ClassRegistrationServiceTest {

    @Mock
    private ClassRegistrationRepository classRegistrationRepository;

    @InjectMocks
    private ClassRegistrationService classRegistrationService;

    @Test
    void shouldReturnMembersOfClass() {
        ClassSession classSession = new ClassSession();
        classSession.setId(5L);

        ClassRegistration registration = new ClassRegistration();
        registration.setId(7L);
        registration.setClassSession(classSession);

        when(classRegistrationRepository.findAll()).thenReturn(List.of(registration));

        assertEquals(List.of(registration), classRegistrationService.getMembersOfClass(5L));
    }
}
