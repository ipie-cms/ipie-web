import React, { useRef, useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

import { signupSchema, signupUiSchema } from './schema';
import { TextWidget, SelectWidget, RadioWidget, OtpWidget, ValidateWidget, AccountTypeWidget } from './widgets';
import { FieldTemplate, ObjectFieldTemplate, FieldErrorTemplate } from './templates';

const widgets = {
    TextWidget,
    SelectWidget,
    RadioWidget,
    otp: OtpWidget,
    validate: ValidateWidget,
    accountType: AccountTypeWidget,
};

const templates = { FieldTemplate, ObjectFieldTemplate, FieldErrorTemplate };

export default function RegisterForm() {
    const formRef = useRef(null);

    // Draft load karo (agar pehle save kiya tha)
    const [formData, setFormData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ipie_signup_draft')) || undefined;
        } catch {
            return undefined;
        }
    });

    const formContext = {
        // Yahan apni API calls lagao
        sendOtp: (field, value) => {
            console.log('SEND OTP →', field, value);
            alert(`OTP sent for ${field}: ${value}`);
        },
        validateField: (field, value) => {
            console.log('VALIDATE →', field, value);
            alert(`Validating ${field}: ${value}`);
        },
    };

    const saveDraft = () => {
        localStorage.setItem('ipie_signup_draft', JSON.stringify(formData || {}));
        alert('Draft saved successfully!');
    };

    return (
        <div className="p-5 md:p-8">
            {/* Heading */}
            <h2 className="text-xl font-bold text-gray-900">Create an Account</h2>
            <p className="text-[12px] text-gray-500 mt-1">Fill in your details to get started</p>
            <div className="flex justify-end text-[11px] text-gray-500 mt-2 mb-4">
                <span className="text-red-500 mr-1">*</span> Indicates Mandatory Fields
            </div>

            {/* RJSF Form */}
            <Form
                ref={formRef}
                schema={signupSchema}
                uiSchema={signupUiSchema}
                validator={validator}
                widgets={widgets}
                templates={templates}
                formContext={formContext}
                formData={formData}
                onChange={(e) => setFormData(e.formData)}
                onSubmit={({ formData }) => {
                    console.log('FINAL SUBMIT →', formData);
                    alert('Form validated! Preview ready.');
                    // yahan PREVIEW page pe navigate karo
                }}
                noHtml5Validate
            />

            {/* ===== Bottom buttons (FIXED) ===== */}
            <div className="flex items-center justify-between mt-6">
                <button
                    type="button"
                    onClick={saveDraft}
                    className="btn-save-draft px-6 h-10 rounded-md border border-red-400 text-red-500 text-[12px] font-bold tracking-wide transition-all duration-200"
                >
                    SAVE DRAFT
                </button>

                <button
                    type="button"
                    onClick={() => formRef.current?.submit()}
                    className="btn-preview px-10 h-10 rounded-md bg-blue-600 text-white text-[12px] font-bold tracking-wide shadow transition-colors"
                >
                    PREVIEW
                </button>
            </div>
        </div>
    );
}