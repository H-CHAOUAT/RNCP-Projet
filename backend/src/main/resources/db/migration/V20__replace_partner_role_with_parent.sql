-- PARTNER role removed: the spouse is a PARENT (personas: Adult / Parent / Child)
UPDATE users SET role = 'PARENT' WHERE role = 'PARTNER';
