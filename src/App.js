import React, { useEffect, useRef, useState } from "react";
import './style.css';
import TimeTable from "./components/TimeTable";
import CourseTable from "./components/CourseTable";

let timeoutID = 1

export default function App() {
  const [courses, setCourses] = useState(
    JSON.parse(localStorage.getItem('courses')) || []
  )

  const [alertText, setAlertText] = useState('')
  const [resetAlert, setResetAlert] = useState(false)
  const [totalUnits, setTotalUnits] = useState(0)

  const courseInputs = {
    code: useRef(null),
    name: useRef(null),
    professor: useRef(null),
    unit: useRef(null),
    day: useRef(null),
    time: useRef(null),
    classType: useRef(null),
    examDate: useRef(null),
    examTime: useRef(null)
  }

  function inputReset() {
    courseInputs.name.current.value = ''
    courseInputs.professor.current.value = ''
    courseInputs.unit.current.value = 0
    courseInputs.day.current.value = 5
    courseInputs.time.current.value = 8
    courseInputs.classType.current.value = 'static'
    courseInputs.examDate.current.value = ''
    courseInputs.examTime.current.value = ''
  }

  useEffect(() => {
    inputReset()
    localStorage.setItem('courses', JSON.stringify(courses))
    setTotalUnits(() => {
      let units = 0
      courses.forEach(course => units += Number(course.unit))
      return units
    })
  }, [courses])

  function checkAlert() {
    if (courseInputs.code.current.value === '') {
      setAlertText('فیلد کد درس نمی تواند خالی باشد')
      return true
    }
    
    let needAlert = 0
    let codeFound = false
    courses.forEach(course => {
      course.times.forEach(time => {
        if (time.day === courseInputs.day.current.value && time.startTime === courseInputs.time.current.value && course.code === courseInputs.code.current.value) {
          if (time.timeType === 'static') {
            needAlert = -1
          }
          else if (time.timeType === courseInputs.classType.current.value) {
            needAlert = -1
          }
        }
        else if (time.day === courseInputs.day.current.value && time.startTime === courseInputs.time.current.value) {
          if (time.timeType === 'static') {
            needAlert = 1
          }
          else if (time.timeType === courseInputs.classType.current.value) {
            needAlert = 1
          }
        }
      })

      
      if (course.code === courseInputs.code.current.value) {
        codeFound = true
      }
    })
    
    if (needAlert === 1) {
      setAlertText('درس وارد شده با یکی از دروس انتخاب شده قبل تداخل دارد')
      return true
    }
    else if (needAlert === -1) {
      setAlertText('در این روز و ساعت درس مذکور قبلا وارد شده است')
      return true
    }
    
    if (!codeFound) {
      if (courseInputs.name.current.value === '' || courseInputs.professor.current.value === '' || courseInputs.unit.current.value === '0') {
        setAlertText('اطلاعات لازم برای درس به طور کامل وارد نشده اند. لطفا اطلاعات را کامل کرده و دوباره امتحان کنید')
        return true
      }
    }
    
    return false
  }

  useEffect(() => {
    clearTimeout(timeoutID)
    inputReset()
    timeoutID = setTimeout(() => {
      setAlertText('')
    }, 3000)
  }, [alertText])

  function submit() {
    let found = false
    let needAlert = checkAlert()

    if (!needAlert) {
      courses.forEach(course => {
        if (course.code === courseInputs.code.current.value) {
          found = true
        }
      })
  
      if (found) {
        setCourses(oldCourses => (
          oldCourses.map(course => {
            if (courseInputs.code.current.value === course.code) {
              return {
                ...course,
                times: [
                  ...course.times,
                  {
                    day: courseInputs.day.current.value,
                    startTime: courseInputs.time.current.value,
                    timeType: courseInputs.classType.current.value
                  }
                ]
              }
            }
            else {
              return course
            }
          })
        ))
      }
      else {
        setCourses(oldCourses => (
          [
            ...oldCourses,
            {
              code: courseInputs.code.current.value,
              name: courseInputs.name.current.value,
              professor: courseInputs.professor.current.value,
              unit: courseInputs.unit.current.value,
              times: [
                {
                  day: courseInputs.day.current.value,
                  startTime: courseInputs.time.current.value,
                  timeType: courseInputs.classType.current.value
                }
              ],
              examDate: courseInputs.examDate.current.value,
              examTime: courseInputs.examTime.current.value
            }
          ]
        ))
      }
    }
  }

  function deleteCourse(code) {
    setCourses(oldCourses => (
      oldCourses.filter(course => course.code !== code)
    ))
  }

  function resetLS() {
    setResetAlert(false)
    courseInputs.code.current.value = ''
    localStorage.removeItem('courses')
    window.location.reload()
  }

  const resetStyle = {
    display: resetAlert ? 'flex' : 'none'
  }

  return (
    <main>
      <h1>پیش انتخاب واحد</h1>
      <p className="creator-name">**ساخته شده توسط امیر نظری**</p>
      <p className="description">
        <span className="description--title">توضیحات قبل از استفاده از سایت:</span> سعی شود تمامی ورودی های خواسته شده با دقت وارد شود. درصورت نیاز به اضافه کردن ساعت کلاسی به درس خاصی، کد درس مربوطه را وارد کنید و سپس فقط روز و ساعت و نوع برگزاری کلاس را مشخص کنید و بقیه فیلدها را خالی بگذارید. برای حذف درس مورد نظر هم در جدول دوم موس را بر روی گوشه راست باکس کد درس مربوطه برده و روی دکمه حذف کلیک نمایید. برای پرینت برنامه یا تبدیل به فایل پی دی اف، برای روی صفحه کلیک راست کرده و برروی گزینه پرینت کلیک نمایید
      </p>
      <p className="alert-text">{alertText}</p>
      <div className="inputs-container">
        <input type="text" placeholder="*کد درس" ref={courseInputs.code} />
        <input type="text" placeholder="*نام درس" ref={courseInputs.name} />
        <input type="text" placeholder="*نام استاد" ref={courseInputs.professor} />
        <select ref={courseInputs.unit}>
          <option value={0}>واحد درسی</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
        <select ref={courseInputs.day}>
          <option value={5}>شنبه</option>
          <option value={4}>یکشنبه</option>
          <option value={3}>دوشنبه</option>
          <option value={2}>سه شنبه</option>
          <option value={1}>چهارشنبه</option>
          <option value={0}>پنج شنبه</option>
        </select>
        <select ref={courseInputs.time}>
          <option value={8}>8 - 10</option>
          <option value={10}>10 - 12</option>
          <option value={12}>12 - 14</option>
          <option value={14}>14 - 16</option>
          <option value={16}>16 - 18</option>
          <option value={18}>18 - 20</option>
        </select>
        <select ref={courseInputs.classType}>
          <option value={'static'}>ثابت</option>
          <option value={'odd'}>هفته فرد</option>
          <option value={'even'}> هفته زوج</option>
        </select>
        <input type="text" placeholder="تاریخ امتحان" ref={courseInputs.examDate} />
        <input type="text" placeholder="ساعت امتحان" ref={courseInputs.examTime} />
      </div>
      <div className="buttons-container">
        <button onClick={() => setResetAlert(true)} className="inputs-button">پاک کردن همه</button>
        <button onClick={submit} className="inputs-button">ثبت</button>
      </div>
      <div className="reset-alert" style={resetStyle}>
        <div className="reset-alert--inner-container">
          <p>مطمئن هستید که میخواهید کل برنامه و دروس را به طور کامل پاک کنید؟ این عمل غیر قابل بازگشت می باشد</p>
          <div className="reset-alert--buttons-container">
            <button onClick={() => setResetAlert(false)}>خیر</button>
            <button onClick={resetLS}>بله</button>
          </div>
        </div>
      </div>
      <TimeTable courses={courses} />
      <br /><br /><br />
      <p className="unit-text">تعداد واحد انتخاب شده: {totalUnits}</p>
      <CourseTable courses={courses} deleteCourse={deleteCourse} />
    </main>
  )
}