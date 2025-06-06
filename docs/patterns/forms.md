# Form Patterns

Common patterns for building forms with Theta components.

## Basic Form

```jsx
import { Form, FormField, Input, Button, Stack } from '@theta/web';

function ContactForm() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Stack spacing="md">
        <FormField label="Name" required>
          <Input name="name" />
        </FormField>
        
        <FormField label="Email" required>
          <Input type="email" name="email" />
        </FormField>
        
        <FormField label="Message">
          <TextArea name="message" rows={4} />
        </FormField>
        
        <Button type="submit" variant="primary">
          Send Message
        </Button>
      </Stack>
    </Form>
  );
}
```

## Form with Validation

```jsx
function SignUpForm() {
  const [errors, setErrors] = useState({});
  
  const validate = (data) => {
    const newErrors = {};
    
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    return newErrors;
  };
  
  const handleSubmit = (data) => {
    const validationErrors = validate(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit form
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Stack spacing="md">
        <FormField label="Email" required error={errors.email}>
          <Input type="email" name="email" />
        </FormField>
        
        <FormField label="Password" required error={errors.password}>
          <Input type="password" name="password" />
        </FormField>
        
        <FormField label="Confirm Password" required error={errors.confirmPassword}>
          <Input type="password" name="confirmPassword" />
        </FormField>
        
        <Checkbox name="terms" label="I agree to the terms and conditions" />
        
        <Button type="submit" variant="primary" fullWidth>
          Create Account
        </Button>
      </Stack>
    </Form>
  );
}
```

## Multi-Step Form

```jsx
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const nextStep = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  return (
    <Card>
      <Stack spacing="lg">
        <ProgressBar value={step} max={3} />
        
        {step === 1 && (
          <Form onSubmit={nextStep}>
            <Stack spacing="md">
              <Text variant="heading-sm">Personal Information</Text>
              
              <FormField label="First Name" required>
                <Input name="firstName" defaultValue={formData.firstName} />
              </FormField>
              
              <FormField label="Last Name" required>
                <Input name="lastName" defaultValue={formData.lastName} />
              </FormField>
              
              <Button type="submit" variant="primary">
                Next
              </Button>
            </Stack>
          </Form>
        )}
        
        {step === 2 && (
          <Form onSubmit={nextStep}>
            <Stack spacing="md">
              <Text variant="heading-sm">Contact Details</Text>
              
              <FormField label="Email" required>
                <Input type="email" name="email" defaultValue={formData.email} />
              </FormField>
              
              <FormField label="Phone">
                <Input type="tel" name="phone" defaultValue={formData.phone} />
              </FormField>
              
              <Inline spacing="md">
                <Button variant="secondary" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit" variant="primary">
                  Next
                </Button>
              </Inline>
            </Stack>
          </Form>
        )}
        
        {step === 3 && (
          <Stack spacing="md">
            <Text variant="heading-sm">Review</Text>
            
            <Card variant="subtle">
              <Stack spacing="sm">
                <Text><strong>Name:</strong> {formData.firstName} {formData.lastName}</Text>
                <Text><strong>Email:</strong> {formData.email}</Text>
                <Text><strong>Phone:</strong> {formData.phone || 'Not provided'}</Text>
              </Stack>
            </Card>
            
            <Inline spacing="md">
              <Button variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Inline>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
```

## Inline Form

```jsx
function NewsletterForm() {
  return (
    <Form onSubmit={handleSubscribe}>
      <Inline spacing="sm">
        <Input 
          type="email" 
          name="email" 
          placeholder="Enter your email"
          style={{ flex: 1 }}
        />
        <Button type="submit" variant="primary">
          Subscribe
        </Button>
      </Inline>
    </Form>
  );
}
```

## Form with Sections

```jsx
function AccountSettingsForm() {
  return (
    <Form onSubmit={handleSave}>
      <Stack spacing="xl">
        <Stack spacing="md">
          <Text variant="heading-sm">Profile Information</Text>
          
          <FormField label="Display Name">
            <Input name="displayName" />
          </FormField>
          
          <FormField label="Bio">
            <TextArea name="bio" rows={3} />
          </FormField>
        </Stack>
        
        <Divider />
        
        <Stack spacing="md">
          <Text variant="heading-sm">Preferences</Text>
          
          <FormField label="Language">
            <Select name="language" options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' }
            ]} />
          </FormField>
          
          <Stack spacing="sm">
            <Checkbox name="emailNotifications" label="Email notifications" />
            <Checkbox name="smsNotifications" label="SMS notifications" />
          </Stack>
        </Stack>
        
        <Divider />
        
        <Inline spacing="md">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
          <Button variant="secondary">
            Cancel
          </Button>
        </Inline>
      </Stack>
    </Form>
  );
}
```

## Best Practices

1. **Always use FormField** - Provides consistent label, error, and help text handling
2. **Group related fields** - Use Stack to create visual groupings
3. **Clear actions** - Primary action should be obvious
4. **Inline validation** - Show errors near the relevant field
5. **Progress indication** - Show progress for multi-step forms
6. **Accessible labels** - All inputs need associated labels
7. **Required fields** - Clearly mark required fields
8. **Help text** - Provide guidance for complex fields