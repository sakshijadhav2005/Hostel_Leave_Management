function longLeave(doc) {
  const student = doc.student_id;
  return {
    id: doc._id.toString(),
    student_id: (student && student._id) ? student._id.toString() : (student && student.toString ? student.toString() : undefined),
    student: (student && student._id) ? {
      id: student._id.toString(),
      name: student.name || 'Unknown',
      room_no: student.room_no || '-',
      hostel_no: student.hostel_no || '-',
      role: student.role || 'student',
    } : {
      id: 'unknown',
      name: 'Unknown',
      room_no: '-',
      hostel_no: '-',
      role: 'student',
    },
    reason: doc.reason,
    submit_time: doc.submit_time,
    return_date: doc.return_date,
    from_date: doc.from_date,
    to_date: doc.to_date,
    emergency_contact: doc.emergency_contact,
    address_during_leave: doc.address_during_leave,
    status: doc.status,
  }
}

function shortLeave(doc) {
  const student = doc.student_id;
  return {
    id: doc._id.toString(),
    student_id: (student && student._id) ? student._id.toString() : (student && student.toString ? student.toString() : undefined),
    student: (student && student._id) ? {
      id: student._id.toString(),
      name: student.name || 'Unknown',
      room_no: student.room_no || '-',
      hostel_no: student.hostel_no || '-',
      role: student.role || 'student',
    } : {
      id: 'unknown',
      name: 'Unknown',
      room_no: '-',
      hostel_no: '-',
      role: 'student',
    },
    reason: doc.reason,
    out_time: doc.out_time,
    return_time: doc.return_time,
    status: doc.status,
  }
}

module.exports = { toDTO: { longLeave, shortLeave } }
