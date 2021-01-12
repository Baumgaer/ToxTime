process.environment = {};
// First convert all environment variables to their right type
for (const key in process.env) {
    if (Object.hasOwnProperty.call(process.env, key)) {
        const value = process.env[key];
        try {
            process.environment[key] = JSON.parse(value);
        } catch (error) {
            process.environment[key] = value;
        }
    }
}
