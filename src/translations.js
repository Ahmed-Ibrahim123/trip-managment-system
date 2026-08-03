export const translations = {
    en: {
        // App / Navigation
        appTitle: 'Yalla Nefsel Trip Manager',
        navTrips: 'Trips',
        navAddBooking: 'Add Booking',
        navStaffManagement: 'Staff Management',
        navLogout: 'Logout',

        // Settings Modal
        settingsTitle: 'Settings',
        themeLabel: 'Theme',
        themeLight: 'Light ☀️',
        themeDark: 'Dark 🌙',
        languageLabel: 'Language',
        langEnglish: 'English 🇬🇧',
        langArabic: 'العربية 🇪🇬',

        // Auth (Login / Register)
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to your TripManager portal',
        usernameLabel: 'Username',
        usernamePlaceholder: 'Enter your username',
        usernameHint: 'Your unique system login handle',
        passwordLabel: 'Password',
        passwordHint: 'Your account secure password',
        passwordSecureHint: 'Must be at least 6 characters long.',
        btnSignIn: 'Sign In',
        btnSigningIn: 'Signing in...',
        linkAddEmployee: 'Need to create staff credentials? Add Employee',
        
        regTitle: 'Register New Account',
        regSubtitle: 'Create a new staff credential for the trip management portal.',
        regUsernamePlaceholder: 'e.g. john_doe',
        regUsernameHint: "Choose a unique identifier for the staff member's login.",
        regPasswordPlaceholder: 'Enter secure password',
        regRoleLabel: 'Role',
        regRoleEmployee: '👤 Employee — Can add & edit bookings',
        regRoleAdmin: '👑 Admin — Full access',
        regRoleHint: 'Employees can create and edit bookings. Admins have full CRUD access.',
        regAuthKeyLabel: 'Admin Authorization Key',
        regAuthKeyPlaceholder: 'Enter system admin secret',
        regAuthKeyHint: 'Required security key to authorize new account creation.',
        btnRegister: 'Register Account',
        btnRegistering: 'Registering...',
        linkLogin: 'Already have an account? Log in here',

        // Trips Page (Dashboard)
        tripsOverviewTitle: 'Trips Overview',
        tripsOverviewSubtitle: 'Manage all upcoming and past trips.',
        statTotalTrips: 'Total Trips',
        statTotalBookings: 'Total Bookings',
        statTotalGuests: 'Total Guests',
        
        createTripTitle: 'Create New Trip',
        tripNameLabel: 'Trip Name',
        tripNamePlaceholder: 'e.g., Dahab Summer Trip',
        tripDateLabel: 'Trip Date',
        tripNotesLabel: 'Notes (Optional)',
        tripNotesPlaceholder: 'Internal notes about this trip...',
        btnCreateTrip: 'Create Trip',
        btnCreating: 'Creating...',
        
        searchPlaceholder: 'Search trips...',
        noTripsFound: 'No trips found.',
        
        // Trip Card
        cardGuests: 'Guests',
        cardBookings: 'Bookings',
        cardViewDetails: 'View Details ➔',
        
        // Trip Dashboard (Single Trip)
        btnBackToTrips: '← Back to Trips',
        tabOverview: 'Overview',
        btnDeleteTrip: 'Delete Trip',
        tripGuests: 'Guests',
        tripBookings: 'Bookings',
        
        recentBookings: 'Recent Bookings',
        noBookingsYet: 'No bookings for this trip yet.',
        colClientName: 'Client Name',
        colMobile: 'Mobile Number',
        colPersons: 'Persons',
        colNotes: 'Notes',
        colActions: 'Actions',
        
        btnEdit: 'Edit',
        btnDelete: 'Delete',
        btnSave: 'Save',
        btnCancel: 'Cancel',

        // Add Booking Form
        addBookingTitle: '➕ Add New Booking',
        addBookingSubtitle: 'Fill in the client and trip details below.',
        formTripLabel: 'Trip',
        formSelectTrip: '— Select a trip —',
        formNoTrips: 'No trips available. Ask an admin to create a trip.',
        formNoTripsAdmin: 'No trips available. Create a trip first.',
        formCustomerName: 'Customer Name',
        formCustomerNamePlaceholder: 'Full name of the customer',
        formMobileNumber: 'Mobile Number',
        formMobileNumberPlaceholder: 'e.g. 01012345678',
        formMobileHint: 'Each mobile number can only be registered once per trip.',
        formNoOfPersons: 'Number of Persons',
        btnAddBooking: '✅ Add Booking',
        btnSaving: 'Saving...',
        
        // Employees (Staff Management)
        staffTitle: 'Staff Management',
        staffSubtitle: 'Manage system access and employee credentials.',
        employeesList: 'Employees List',
        colUsername: 'Username',
        colRole: 'Role',
        colJoined: 'Joined',
        noEmployeesFound: 'No employees found.',
        employee: 'Employee',
        admin: 'Admin'
    },
    ar: {
        // App / Navigation
        appTitle: 'مدير رحلات يلا نفصل',
        navTrips: 'الرحلات',
        navAddBooking: 'إضافة حجز',
        navStaffManagement: 'إدارة الموظفين',
        navLogout: 'تسجيل الخروج',

        // Settings Modal
        settingsTitle: 'الإعدادات',
        themeLabel: 'المظهر',
        themeLight: 'فاتح ☀️',
        themeDark: 'داكن 🌙',
        languageLabel: 'اللغة',
        langEnglish: 'English 🇬🇧',
        langArabic: 'العربية 🇪🇬',

        // Auth (Login / Register)
        loginTitle: 'مرحباً بعودتك',
        loginSubtitle: 'تسجيل الدخول إلى بوابة إدارة الرحلات',
        usernameLabel: 'اسم المستخدم',
        usernamePlaceholder: 'أدخل اسم المستخدم',
        usernameHint: 'معرف الدخول الفريد الخاص بك',
        passwordLabel: 'كلمة المرور',
        passwordHint: 'كلمة المرور الآمنة لحسابك',
        passwordSecureHint: 'يجب أن لا تقل عن 6 أحرف.',
        btnSignIn: 'تسجيل الدخول',
        btnSigningIn: 'جاري تسجيل الدخول...',
        linkAddEmployee: 'هل تريد إنشاء حساب موظف؟ إضافة موظف',
        
        regTitle: 'تسجيل حساب جديد',
        regSubtitle: 'إنشاء حساب موظف جديد لبوابة إدارة الرحلات.',
        regUsernamePlaceholder: 'مثال: john_doe',
        regUsernameHint: 'اختر معرفاً فريداً لتسجيل دخول الموظف.',
        regPasswordPlaceholder: 'أدخل كلمة مرور آمنة',
        regRoleLabel: 'الدور',
        regRoleEmployee: '👤 موظف — يمكنه إضافة وتعديل الحجوزات',
        regRoleAdmin: '👑 مدير — صلاحيات كاملة',
        regRoleHint: 'الموظفون يمكنهم إنشاء وتعديل الحجوزات. المدراء يملكون صلاحيات كاملة.',
        regAuthKeyLabel: 'مفتاح تفويض المدير',
        regAuthKeyPlaceholder: 'أدخل مفتاح النظام السري',
        regAuthKeyHint: 'مفتاح الأمان المطلوب للسماح بإنشاء حساب جديد.',
        btnRegister: 'تسجيل الحساب',
        btnRegistering: 'جاري التسجيل...',
        linkLogin: 'لديك حساب بالفعل؟ سجل دخولك هنا',

        // Trips Page (Dashboard)
        tripsOverviewTitle: 'نظرة عامة على الرحلات',
        tripsOverviewSubtitle: 'إدارة جميع الرحلات القادمة والسابقة.',
        statTotalTrips: 'إجمالي الرحلات',
        statTotalBookings: 'إجمالي الحجوزات',
        statTotalGuests: 'إجمالي الضيوف',
        
        createTripTitle: 'إنشاء رحلة جديدة',
        tripNameLabel: 'اسم الرحلة',
        tripNamePlaceholder: 'مثال: رحلة دهب الصيفية',
        tripDateLabel: 'تاريخ الرحلة',
        tripNotesLabel: 'ملاحظات (اختياري)',
        tripNotesPlaceholder: 'ملاحظات داخلية حول هذه الرحلة...',
        btnCreateTrip: 'إنشاء رحلة',
        btnCreating: 'جاري الإنشاء...',
        
        searchPlaceholder: 'ابحث عن رحلات...',
        noTripsFound: 'لم يتم العثور على رحلات.',
        
        // Trip Card
        cardGuests: 'ضيوف',
        cardBookings: 'حجوزات',
        cardViewDetails: 'عرض التفاصيل ➔',
        
        // Trip Dashboard (Single Trip)
        btnBackToTrips: '← العودة للرحلات',
        tabOverview: 'نظرة عامة',
        btnDeleteTrip: 'حذف الرحلة',
        tripGuests: 'ضيوف',
        tripBookings: 'حجوزات',
        
        recentBookings: 'أحدث الحجوزات',
        noBookingsYet: 'لا توجد حجوزات لهذه الرحلة حتى الآن.',
        colClientName: 'اسم العميل',
        colMobile: 'رقم الموبايل',
        colPersons: 'الأشخاص',
        colNotes: 'ملاحظات',
        colActions: 'إجراءات',
        
        btnEdit: 'تعديل',
        btnDelete: 'حذف',
        btnSave: 'حفظ',
        btnCancel: 'إلغاء',

        // Add Booking Form
        addBookingTitle: '➕ إضافة حجز جديد',
        addBookingSubtitle: 'املأ بيانات العميل والرحلة أدناه.',
        formTripLabel: 'الرحلة',
        formSelectTrip: '— اختر رحلة —',
        formNoTrips: 'لا توجد رحلات متاحة. اطلب من المدير إنشاء رحلة.',
        formNoTripsAdmin: 'لا توجد رحلات متاحة. قم بإنشاء رحلة أولاً.',
        formCustomerName: 'اسم العميل',
        formCustomerNamePlaceholder: 'الاسم الكامل للعميل',
        formMobileNumber: 'رقم الموبايل',
        formMobileNumberPlaceholder: 'مثال: 01012345678',
        formMobileHint: 'يمكن تسجيل رقم الموبايل مرة واحدة فقط لكل رحلة.',
        formNoOfPersons: 'عدد الأشخاص',
        btnAddBooking: '✅ إضافة الحجز',
        btnSaving: 'جاري الحفظ...',
        
        // Employees (Staff Management)
        staffTitle: 'إدارة الموظفين',
        staffSubtitle: 'إدارة صلاحيات النظام وحسابات الموظفين.',
        employeesList: 'قائمة الموظفين',
        colUsername: 'اسم المستخدم',
        colRole: 'الدور',
        colJoined: 'تاريخ الانضمام',
        noEmployeesFound: 'لم يتم العثور على موظفين.',
        employee: 'موظف',
        admin: 'مدير'
    }
};
