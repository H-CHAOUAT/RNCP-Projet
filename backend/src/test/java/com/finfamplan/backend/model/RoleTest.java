package com.finfamplan.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RoleTest {

    @Test
    void testEnumValues() {
        assertNotNull(Role.PARENT);
        assertNotNull(Role.PARTNER);
        assertNotNull(Role.CHILD);
        assertNotNull(Role.ADMIN);
    }

    @Test
    void testInvalidRoleThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> Role.valueOf("USER"));
    }

    @Test
    void testRoleNamesMatch() {
        // Ensure the enum names are correct
        assertEquals("PARENT", Role.PARENT.name());
        assertEquals("ADMIN", Role.ADMIN.name());
    }
}
