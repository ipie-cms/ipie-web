export const signupSchema = {
  type: 'object',
  properties: {
    accountDetails: {
      type: 'object',
      title: 'Account Details',
      required: ['accountType'],
      properties: {
        accountType: {
          type: 'string',
          title: 'User Account Type',
          enum: ['Individual', 'Entity'],
          default: 'Individual',
        },
      },
    },

    personalDetails: {
      type: 'object',
      title: 'Personal Details',
      required: ['category', 'name', 'mobile', 'email', 'address1', 'state', 'district', 'city', 'pin'],
      properties: {
        category: { type: 'string', title: 'Select Category', enum: ['Indian', 'NRI', 'Foreigner'], default: 'Indian' },
        name: { type: 'string', title: 'Name' },
        mobile: { type: 'string', title: 'Mobile Number', pattern: '^[0-9]{10}$' },
        email: { type: 'string', title: 'Email ID', format: 'email' },
        address1: { type: 'string', title: 'Address Line 1' },
        address2: { type: 'string', title: 'Address Line 2' },
        state: { type: 'string', title: 'State', enum: ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu'] },
        district: { type: 'string', title: 'District', enum: ['Mumbai', 'Pune', 'New Delhi', 'Bengaluru'] },
        city: { type: 'string', title: 'City', enum: ['Mumbai', 'Pune', 'New Delhi', 'Bengaluru'] },
        pin: { type: 'string', title: 'PIN', pattern: '^[0-9]{6}$' },
      },
    },

    identityProof: {
      type: 'object',
      title: 'Identity Proof',
      description: 'Identity verification requires either a valid PAN card or an Aadhaar authentication card.',
      required: ['hasPan', 'idType', 'idNumber'],
      properties: {
        hasPan: { type: 'string', title: 'Do you have PAN Card?', enum: ['YES', 'NO'], default: 'YES' },
        idType: { type: 'string', title: 'Identification ID Type', enum: ['PAN Card', 'Aadhaar'], default: 'PAN Card' },
        idNumber: { type: 'string', title: 'Identification Number' },
      },
    },

    professionalDetails: {
      type: 'object',
      title: 'Professional Details',
      required: ['professionalRole'],
      properties: {
        professionalRole: {
          type: 'string',
          title: 'Professional Roles',
          enum: ['Insolvency Professional', 'Insolvency Professional Entity', 'Authorised Representative'],
          default: 'Insolvency Professional',
        },
        professionalIdType: { type: 'string', title: 'Professional Identification Type', enum: ['IBBI Registration Number', 'Membership Number'] },
        professionalIdValue: { type: 'string', title: 'Professional Identification Value' },
      },
    },
  },
};

export const signupUiSchema = {
  'ui:order': ['accountDetails', 'personalDetails', 'identityProof', 'professionalDetails'],
  'ui:options': { submitButtonOptions: { norender: true } }, // default submit button hide

  accountDetails: {
    accountType: { 'ui:widget': 'accountType' },
  },

  personalDetails: {
    category: { 'ui:widget': 'radio', classNames: 'md:col-span-2' },
    name: { 'ui:placeholder': 'Enter Full Name', classNames: 'md:col-span-2' },
    mobile: { 'ui:widget': 'otp', 'ui:placeholder': 'Enter Mobile Number', 'ui:options': { fieldKey: 'mobile' } },
    email: { 'ui:widget': 'otp', 'ui:placeholder': 'Enter Email ID', 'ui:options': { fieldKey: 'email' } },
    address1: { 'ui:placeholder': 'Enter Address' },
    address2: { 'ui:placeholder': 'Enter Address' },
    state: { 'ui:placeholder': 'Select State' },
    district: { 'ui:placeholder': 'Select District' },
    city: { 'ui:placeholder': 'Select City' },
    pin: { 'ui:placeholder': 'Enter PIN Code' },
  },

  identityProof: {
    hasPan: { 'ui:widget': 'radio', classNames: 'md:col-span-2' },
    idType: { 'ui:placeholder': 'PAN Card' },
    idNumber: { 'ui:widget': 'validate', 'ui:placeholder': 'Enter ID Number', 'ui:options': { fieldKey: 'idNumber' } },
  },

  professionalDetails: {
    professionalRole: { classNames: 'md:col-span-2' },
    professionalIdType: { 'ui:placeholder': 'IBBI Registration Number' },
    professionalIdValue: { 'ui:widget': 'validate', 'ui:placeholder': 'Enter ID Number', 'ui:options': { fieldKey: 'professionalIdValue' } },
  },
};
