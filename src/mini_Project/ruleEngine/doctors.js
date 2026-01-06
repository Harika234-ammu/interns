// // src/ruleEngine/doctors.js
// export const doctors = [
//   {
//     id: 1,
//     name: "Dr. Arjun Mehta",
//     specialty: "Cardiologist",
//     fee: 600,
//     rating: 4.8,
//     bio: "Experienced in treating heart diseases, hypertension, and chest pain.",
//     experience: "15 years",
//     qualifications: "MBBS, MD (Cardiology)",
//     clinic: "HeartCare Clinic",
//     location: "Mumbai",
//     timings: "Mon-Fri 10am-4pm",
//     contact: "+91-9876543210",
//     reviews: [
//       { user: "Ravi", comment: "Very knowledgeable and caring." },
//       { user: "Anita", comment: "Helped me manage my blood pressure well." }
//     ]
//   },
//   {
//     id: 2,
//     name: "Dr. Priya Sharma",
//     specialty: "Pulmonologist",
//     fee: 500,
//     rating: 4.6,
//     bio: "Expert in asthma, chronic cough, and lung-related conditions.",
//     experience: "10 years",
//     qualifications: "MBBS, MD (Pulmonology)",
//     clinic: "BreathWell Clinic",
//     location: "Delhi",
//     timings: "Tue-Sat 11am-5pm",
//     contact: "+91-9123456780",
//     reviews: [
//       { user: "Kiran", comment: "Cured my chronic cough in just 2 visits." },
//       { user: "Meena", comment: "Explains everything clearly, very good doctor." }
//     ]
//   },
//   {
//     id: 3,
//     name: "Dr. Rohan Kumar",
//     specialty: "Neurologist",
//     fee: 700,
//     rating: 4.9,
//     bio: "Specialist in headaches, migraines, memory loss, and balance issues.",
//     experience: "12 years",
//     qualifications: "MBBS, MD (Neurology)",
//     clinic: "NeuroCare Center",
//     location: "Bangalore",
//     timings: "Mon-Thu 9am-3pm",
//     contact: "+91-9988776655",
//     reviews: [
//       { user: "Suresh", comment: "My migraines are much better now." },
//       { user: "Lakshmi", comment: "He listens patiently and provides best treatment." }
//     ]
//   },
//   {
//     id: 4,
//     name: "Dr. Kavya Patel",
//     specialty: "ENT",
//     fee: 400,
//     rating: 4.5,
//     bio: "Treats ear, nose, and throat issues including infections and allergies.",
//     experience: "8 years",
//     qualifications: "MBBS, MS (ENT)",
//     clinic: "ENT Care",
//     location: "Pune",
//     timings: "Mon-Fri 10am-2pm",
//     contact: "+91-9876543211",
//     reviews: [
//       { user: "Rohit", comment: "Solved my ear pain quickly." },
//       { user: "Geeta",comment: "Friendly and explains treatment options well." }
//     ]
//   },
//   {
//     id: 5,
//     name: "Dr. Sameer Joshi",
//     specialty: "Dentist",
//     fee: 350,
//     rating: 4.4,
//     bio: "Focuses on oral health, tooth pain, and gum diseases.",
//     experience: "7 years",
//     qualifications: "BDS",
//     clinic: "Smile Dental Clinic",
//     location: "Mumbai",
//     timings: "Tue-Sat 10am-4pm",
//     contact: "+91-9876543222",
//     reviews: [
//       { user: "Arun", comment: "Painless tooth extraction." },
//       { user: "Seema", comment: "Very gentle and professional." }
//     ]
//   },
//   {
//     id: 6,
//     name: "Dr. Neha Gupta",
//     specialty: "Dermatologist",
//     fee: 450,
//     rating: 4.7,
//     bio: "Skincare specialist for rashes, allergies, and cosmetic treatments.",
//     experience: "9 years",
//     qualifications: "MBBS, MD (Dermatology)",
//     clinic: "SkinCare Clinic",
//     location: "Delhi",
//     timings: "Mon-Fri 11am-6pm",
//     contact: "+91-9876543233",
//     reviews: [
//       { user: "Pooja", comment: "My skin allergy cleared up in 2 weeks." },
//       { user: "Raj", comment: "Great advice for skincare routine." }
//     ]
//   },
//   {
//     id: 7,
//     name: "Dr. Anil Rao",
//     specialty: "Gastroenterologist",
//     fee: 550,
//     rating: 4.6,
//     bio: "Expert in stomach, digestion, and gastrointestinal disorders.",
//     experience: "11 years",
//     qualifications: "MBBS, MD (Gastroenterology)",
//     clinic: "DigestWell Clinic",
//     location: "Bangalore",
//     timings: "Mon-Thu 10am-4pm",
//     contact: "+91-9876543244",
//     reviews: [
//       { user: "Vikas", comment: "Helped me with my acidity problem." },
//       { user: "Kavitha", comment: "Excellent treatment for stomach issues." }
//     ]
//   },
//   {
//     id: 8,
//     name: "Dr. Meera Nair",
//     specialty: "General Physician",
//     fee: 300,
//     rating: 4.3,
//     bio: "Handles common illnesses, fever, fatigue, and general health checkups.",
//     experience: "10 years",
//     qualifications: "MBBS",
//     clinic: "Family Care Clinic",
//     location: "Chennai",
//     timings: "Mon-Sat 9am-3pm",
//     contact: "+91-9876543255",
//     reviews: [
//       { user: "Sunil", comment: "She’s my family doctor for 5 years." },
//       { user: "Anjali", comment: "Very kind and approachable." }
//     ]
//   },
//   {
//     id: 9,
//     name: "Dr. Kavita Nair",
//     specialty: "Ophthalmologist",
//     fee: 750,
//     rating: 4.4,
//     bio: "Specialist in vision and eye-related disorders.",
//     experience: "8 years",
//     qualifications: "MBBS, MS (Ophthalmology)",
//     clinic: "EyeCare Center",
//     location: "Mumbai",
//     timings: "Tue-Sat 10am-5pm",
//     contact: "+91-9876543266",
//     reviews: [
//       { user: "Rahul", comment: "Solved my vision problem with proper glasses." },
//       { user: "Sangeeta", comment: "Best doctor for eye checkups." }
//     ]
//   },
//   {
//     id: 10,
//     name: "Dr. Neha Kapoor",
//     specialty: "ENT",
//     fee: 700,
//     rating: 4.6,
//     bio: "Specialist in ear, nose, and throat disorders.",
//     experience: "12 years",
//     qualifications: "MBBS, MS (ENT)",
//     clinic: "ENT Clinic",
//     location: "Pune",
//     timings: "Mon-Fri 11am-5pm",
//     contact: "+91-9876543277",
//     reviews: [
//       { user: "Manoj", comment: "Very effective treatment for sinus." },
//       { user: "Priya", comment: "Caring and professional." }
//     ]
//   },
//   {
//     id: 11,
//     name: "Dr. Ramesh Verma",
//     specialty: "General Physician",
//     fee: 500,
//     rating: 4.5,
//     bio: "Experienced in treating common illnesses and checkups.",
//     experience: "15 years",
//     qualifications: "MBBS",
//     clinic: "HealthPlus Clinic",
//     location: "Delhi",
//     timings: "Mon-Sat 9am-4pm",
//     contact: "+91-9876543288",
//     reviews: [
//       { user: "Deepak", comment: "Always available for urgent care." },
//       { user: "Kiran", comment: "Great experience every time." }
//     ]
//   }
// ];

// // Get doctors by specialty
// export function getDoctorsBySpecialty(specialty) {
//   return doctors.filter(doc => doc.specialty === specialty);
// }

// // Get doctor by ID
// export function getDoctorById(id) {
//   return doctors.find(doc => doc.id === id);
// }
