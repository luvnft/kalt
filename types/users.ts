export { user };

declare global {
    interface user {
        userId?: string;
        firstName?: string;
        lastName?: string;
        country?: string;
        city?: string;
        postalCode?: string;
        birthdate?: Date;
        addressLine1?: string;
        addressLine2?: string;
        autoInvest?: number;
        newsletters?: boolean;
        termsOfService?: boolean;
        performanceUpdates?: boolean;
        colorScheme?: string;
        profilePicture?: string;
        language?: string;
        currency?: string;
    }
}