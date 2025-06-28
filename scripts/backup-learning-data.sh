#!/bin/bash

# 기존 learning-data 폴더 백업 스크립트

echo "🔄 learning-data 폴더 백업 시작..."

# 현재 날짜 시간으로 백업 폴더명 생성
BACKUP_NAME="learning-data-backup-$(date +%Y%m%d_%H%M%S)"

# 백업 폴더 생성
if [ -d "learning-data" ]; then
    echo "📁 learning-data 폴더를 $BACKUP_NAME 으로 백업..."
    cp -r learning-data "$BACKUP_NAME"
    echo "✅ 백업 완료: $BACKUP_NAME"
    
    echo ""
    echo "📊 백업된 파일 목록:"
    ls -la "$BACKUP_NAME"
    
    echo ""
    echo "🗑️  원본 learning-data 폴더를 삭제하시겠습니까? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf learning-data
        echo "✅ 원본 learning-data 폴더 삭제 완료"
        echo "💾 데이터는 $BACKUP_NAME 에 안전하게 보관되어 있습니다"
    else
        echo "📁 원본 learning-data 폴더 유지"
    fi
else
    echo "❌ learning-data 폴더를 찾을 수 없습니다"
fi

echo ""
echo "🎉 백업 작업 완료!"